"""BusGuard API — 1:1 contract for the v0 frontend mock.

Ticket verify  → POST /verify
Operator search → GET  /operators?q=
Scam report    → POST /report
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal
from urllib.parse import urlparse

from fastapi import FastAPI, File, Form, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from utils.crypto import TICKET_FIELDS, encode_qr_payload, verify_qr_payload

Status = Literal["authorized", "unverified", "scam"]

app = FastAPI(title="BusGuard", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Seed data matching components/safar/views/* mock values ---

GENUINE_TICKET = {
    "pnr": "TNM7748213",
    "operator": "Kallada Travels",
    "route": "Chennai → Madurai",
    "departure": "27 Sep, 10:30 PM",
    "seat": "U12",
    "fare_paid": "₹850",
    "booking_source": "kallada.in (Official)",
}

TICKETS: dict[str, dict[str, str]] = {
    GENUINE_TICKET["pnr"]: GENUINE_TICKET,
}

OPERATORS: list[dict] = [
    {
        "name": "Kallada Travels",
        "region": "Chennai – Kerala",
        "status": "authorized",
        "detail": "Official site: kallada.in",
        "isDomain": False,
    },
    {
        "name": "Rathimeena Travels",
        "region": "Chennai – South TN",
        "status": "authorized",
        "detail": "Official site: rathimeena.com",
        "isDomain": False,
    },
    {
        "name": "SRM Travels",
        "region": "Chennai – Trichy",
        "status": "unverified",
        "detail": "Limited records found",
        "isDomain": False,
    },
    {
        "name": "chennai-bus-tickets-offer.xyz",
        "region": "Website",
        "status": "scam",
        "detail": "Reported 14 times this month",
        "isDomain": True,
    },
    {
        "name": "Parveen Travels",
        "region": "Chennai – Bengaluru",
        "status": "authorized",
        "detail": "Official site: parveentravels.com",
        "isDomain": False,
    },
]

POPULAR = ["Kallada", "Rathimeena", "SRM Travels", "Parveen Travels", "redbus.in"]

DETAIL_LABELS = {
    "pnr": "PNR",
    "operator": "Operator",
    "route": "Route",
    "departure": "Departure",
    "seat": "Seat",
    "fare_paid": "Fare Paid",
    "booking_source": "Booking Source",
}

REPORTS: list[dict] = []


class VerifyRequest(BaseModel):
    qr_payload: str | None = Field(default=None, description="Raw QR scan string")
    pnr: str | None = None
    operator: str | None = None


class DetailItem(BaseModel):
    label: str
    value: str


class VerifyResponse(BaseModel):
    verified: bool
    heading: str
    subtitle: str | None = None
    message: str | None = None
    details: list[DetailItem] | None = None
    pnr: str | None = None
    operator: str | None = None
    route: str | None = None
    departure: str | None = None
    seat: str | None = None
    fare_paid: str | None = None
    booking_source: str | None = None


class OperatorResult(BaseModel):
    name: str
    region: str
    status: Status
    detail: str
    isDomain: bool = False


class OperatorSearchResponse(BaseModel):
    query: str
    count: int
    results: list[OperatorResult]


class ReportResponse(BaseModel):
    submitted: bool
    reference: str
    message: str


def _norm(value: str | None) -> str:
    return (value or "").strip().lower()


def _details_list(ticket: dict[str, str]) -> list[dict[str, str]]:
    items = []
    for key in TICKET_FIELDS:
        value = ticket[key]
        if key == "operator" and "authorized" not in value.lower():
            value = f"{value} (Authorized)"
        items.append({"label": DETAIL_LABELS[key], "value": value})
    return items


def _genuine_response(ticket: dict[str, str]) -> dict:
    return {
        "verified": True,
        "heading": "✅ Verified Genuine Ticket",
        "subtitle": "Matched with operator records",
        "message": None,
        "details": _details_list(ticket),
        **{key: ticket[key] for key in TICKET_FIELDS},
    }


def _fake_response(pnr: str | None = None, operator: str | None = None) -> dict:
    return {
        "verified": False,
        "heading": "🚫 Fake / Unregistered Ticket",
        "subtitle": None,
        "message": "This PNR does not exist in operator records. Do not board or pay.",
        "details": None,
        "pnr": pnr,
        "operator": operator,
        "route": None,
        "departure": None,
        "seat": None,
        "fare_paid": None,
        "booking_source": None,
    }


def _lookup_manual(pnr: str, operator: str | None) -> dict | None:
    ticket = TICKETS.get(pnr.strip().upper())
    if not ticket:
        return None
    if operator and _norm(operator) not in _norm(ticket["operator"]) and _norm(ticket["operator"]) not in _norm(operator):
        return None
    return ticket


def _host_from_url(url: str) -> str:
    text = url.strip()
    if "://" not in text:
        text = f"https://{text}"
    try:
        return (urlparse(text).hostname or "").lower()
    except ValueError:
        return url.strip().lower()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/verify", response_model=VerifyResponse)
def verify_ticket(body: VerifyRequest) -> dict:
    if body.qr_payload:
        ok, ticket = verify_qr_payload(body.qr_payload)
        if ok and ticket:
            stored = TICKETS.get(ticket["pnr"].upper())
            if stored and _norm(stored["pnr"]) == _norm(ticket["pnr"]):
                return _genuine_response(stored)
            if stored is None:
                # Signed payload whose PNR is not in the registry is still
                # treated as genuine if the HMAC verifies (operator-issued).
                return _genuine_response({key: ticket[key] for key in TICKET_FIELDS})
        pnr = None
        operator = None
        if ticket:
            pnr = ticket.get("pnr")
            operator = ticket.get("operator")
        return _fake_response(pnr, operator)

    pnr = (body.pnr or "").strip()
    operator = (body.operator or "").strip()
    if not pnr:
        return _fake_response(None, operator or None)

    found = _lookup_manual(pnr, operator or None)
    if found:
        return _genuine_response(found)
    return _fake_response(pnr.upper(), operator or None)


@app.get("/operators", response_model=OperatorSearchResponse)
def search_operators(q: str = Query(default="", alias="q")) -> dict:
    normalized = q.strip().lower()
    if not normalized:
        results = OPERATORS
    else:
        results = [
            op
            for op in OPERATORS
            if normalized in op["name"].lower() or normalized in op["detail"].lower()
        ]
    return {"query": q, "count": len(results), "results": results}


@app.get("/operators/popular")
def popular_searches() -> dict[str, list[str]]:
    return {"popular": POPULAR}


@app.get("/tickets/sample-qr")
def sample_qr() -> dict:
    payload = encode_qr_payload(GENUINE_TICKET)
    return {
        "qr_payload": payload,
        "pnr": GENUINE_TICKET["pnr"],
        "operator": GENUINE_TICKET["operator"],
    }


@app.post("/report", response_model=ReportResponse)
async def report_scam(
    portal_url: str = Form(default=""),
    impersonated: str = Form(default=""),
    amount: str = Form(default=""),
    description: str = Form(default=""),
    screenshot: UploadFile | None = File(default=None),
) -> dict:
    now = datetime.now(timezone.utc)
    seq = len(REPORTS) + 1
    reference = f"SS-{now:%y%m%d}-{seq:03d}"
    filename = screenshot.filename if screenshot else None

    REPORTS.append(
        {
            "reference": reference,
            "portal_url": portal_url.strip(),
            "impersonated": impersonated.strip(),
            "amount": amount.strip(),
            "description": description.strip(),
            "screenshot": filename,
            "created_at": now.isoformat(),
        }
    )

    host = _host_from_url(portal_url) if portal_url.strip() else ""
    if host:
        existing = next((op for op in OPERATORS if op["name"].lower() == host), None)
        if existing:
            existing["status"] = "scam"
            existing["isDomain"] = True
            existing["detail"] = f"Reported {sum(1 for r in REPORTS if _host_from_url(r['portal_url']) == host)} times this month"
        else:
            OPERATORS.append(
                {
                    "name": host,
                    "region": "Website",
                    "status": "scam",
                    "detail": "Reported 1 time this month",
                    "isDomain": True,
                }
            )

    return {
        "submitted": True,
        "reference": reference,
        "message": (
            f"Reference #{reference}. Our team will review it within 24 hrs "
            "and alert nearby commuters if confirmed."
        ),
    }
