"""HMAC-SHA256 helpers for signed QR ticket payloads.

A genuine QR encodes compact JSON:

    {
      "pnr": "...",
      "operator": "...",
      "route": "...",
      "departure": "...",
      "seat": "...",
      "fare_paid": "...",
      "booking_source": "...",
      "sig": "<hex hmac>"
    }

`sig` is HMAC-SHA256 over a canonical JSON string of the ticket fields
(excluding `sig`), using `BUSGUARD_HMAC_SECRET`.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import os
from typing import Any

TICKET_FIELDS = (
    "pnr",
    "operator",
    "route",
    "departure",
    "seat",
    "fare_paid",
    "booking_source",
)

DEFAULT_SECRET = "busguard-dev-hmac-secret"


def get_secret() -> bytes:
    return os.environ.get("BUSGUARD_HMAC_SECRET", DEFAULT_SECRET).encode("utf-8")


def _canonical_payload(ticket: dict[str, Any]) -> str:
    body = {key: str(ticket.get(key, "")).strip() for key in TICKET_FIELDS}
    return json.dumps(body, separators=(",", ":"), sort_keys=True, ensure_ascii=False)


def sign_ticket(ticket: dict[str, Any], *, secret: bytes | None = None) -> str:
    key = secret if secret is not None else get_secret()
    message = _canonical_payload(ticket).encode("utf-8")
    return hmac.new(key, message, hashlib.sha256).hexdigest()


def verify_ticket_signature(
    ticket: dict[str, Any],
    signature: str,
    *,
    secret: bytes | None = None,
) -> bool:
    expected = sign_ticket(ticket, secret=secret)
    provided = (signature or "").strip().lower()
    return hmac.compare_digest(expected, provided)


def encode_qr_payload(ticket: dict[str, Any], *, secret: bytes | None = None) -> str:
    payload = {key: str(ticket.get(key, "")).strip() for key in TICKET_FIELDS}
    payload["sig"] = sign_ticket(payload, secret=secret)
    return json.dumps(payload, separators=(",", ":"), ensure_ascii=False)


def decode_qr_payload(raw: str) -> dict[str, Any] | None:
    text = (raw or "").strip()
    if not text:
        return None

    if text.startswith("http://") or text.startswith("https://"):
        from urllib.parse import parse_qs, urlparse

        parsed = urlparse(text)
        query = parse_qs(parsed.query)
        if "payload" in query:
            text = query["payload"][0]
        elif parsed.fragment:
            text = parsed.fragment

    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return None

    if not isinstance(data, dict):
        return None
    return data


def verify_qr_payload(
    raw: str,
    *,
    secret: bytes | None = None,
) -> tuple[bool, dict[str, Any] | None]:
    data = decode_qr_payload(raw)
    if data is None:
        return False, None

    signature = str(data.get("sig") or data.get("signature") or "")
    if not signature:
        return False, data

    if not verify_ticket_signature(data, signature, secret=secret):
        return False, data

    ticket = {key: str(data.get(key, "")).strip() for key in TICKET_FIELDS}
    ticket["sig"] = signature
    return True, ticket
