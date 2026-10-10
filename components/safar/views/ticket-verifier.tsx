'use client'

import { CheckCircle2, Flag, QrCode, ScanLine, Search, XCircle } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSampleQr, toErrorMessage, verifyTicket, type VerifyResponse } from '@/lib/api'
import { ViewHeader } from '../view-header'

export function TicketVerifier({ onReport }: { onReport: () => void }) {
  const resultRef = useRef<HTMLElement>(null)
  const [result, setResult] = useState<VerifyResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function runVerify(body: { qr_payload?: string; pnr?: string; operator?: string }) {
    setLoading(true)
    setError(null)
    try {
      const data = await verifyTicket(body)
      setResult(data)
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    } catch (err) {
      setResult(null)
      setError(toErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await runVerify({
      pnr: String(form.get('pnr') ?? ''),
      operator: String(form.get('operator') ?? ''),
    })
  }

  async function handleScan() {
    setLoading(true)
    setError(null)
    try {
      const sample = await getSampleQr()
      const data = await verifyTicket({ qr_payload: sample.qr_payload })
      setResult(data)
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    } catch (err) {
      setResult(null)
      setError(toErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <ViewHeader
        title="Verify Your Ticket"
        description="Scan or enter details to confirm your ticket is genuine."
      />

      <section
        aria-label="QR scanner"
        className="rounded-2xl bg-white p-4 shadow-lg shadow-black/5 dark:bg-slate-800/60"
      >
        <button
          type="button"
          onClick={handleScan}
          disabled={loading}
          className="relative mx-auto flex aspect-square max-h-[260px] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 dark:border-indigo-500/30 dark:bg-indigo-500/5"
        >
          <span className="absolute top-3 left-3 size-6 rounded-tl-lg border-t-4 border-l-4 border-indigo-500" />
          <span className="absolute top-3 right-3 size-6 rounded-tr-lg border-t-4 border-r-4 border-indigo-500" />
          <span className="absolute bottom-3 left-3 size-6 rounded-bl-lg border-b-4 border-l-4 border-indigo-500" />
          <span className="absolute right-3 bottom-3 size-6 rounded-br-lg border-r-4 border-b-4 border-indigo-500" />
          <div className="flex size-20 items-center justify-center rounded-2xl bg-white shadow-lg shadow-indigo-600/10 dark:bg-slate-900">
            <QrCode className="size-10 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {loading ? 'Scanning…' : 'Tap to Scan QR Code'}
          </p>
        </button>
        <Button
          type="button"
          onClick={handleScan}
          disabled={loading}
          className="mt-4 h-12 w-full rounded-xl bg-indigo-600 text-base font-semibold text-white hover:bg-indigo-700"
        >
          <ScanLine className="size-5" aria-hidden="true" />
          {loading ? 'Scanning…' : 'Open Camera Scanner'}
        </Button>
      </section>

      <div className="flex items-center gap-3" role="separator">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span className="text-[11px] font-semibold tracking-widest text-slate-400">OR ENTER MANUALLY</span>
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-lg shadow-black/5 dark:bg-slate-800/60"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="pnr">PNR / Ticket ID</Label>
          <Input
            id="pnr"
            name="pnr"
            placeholder="e.g. TNM7748213"
            defaultValue="TNM7748213"
            autoComplete="off"
            className="h-12 rounded-xl px-4 uppercase"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="operator">Bus Operator</Label>
          <Input
            id="operator"
            name="operator"
            placeholder="e.g. Kallada Travels"
            defaultValue="Kallada Travels"
            className="h-12 rounded-xl px-4"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-indigo-600 text-base font-semibold text-white hover:bg-indigo-700"
        >
          <Search className="size-5" aria-hidden="true" />
          {loading ? 'Verifying…' : 'Verify Ticket'}
        </Button>
      </form>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : null}

      {result?.verified ? (
        <section
          ref={resultRef}
          aria-live="polite"
          aria-labelledby="verified-heading"
          className="scroll-mt-20 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-lg shadow-emerald-600/10 dark:border-emerald-500/20 dark:bg-emerald-950/40"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h2 id="verified-heading" className="text-lg font-bold tracking-tight text-emerald-800 dark:text-emerald-300">
                {result.heading}
              </h2>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">{result.subtitle}</p>
            </div>
          </div>
          <dl className="mt-4 divide-y divide-emerald-200/70 rounded-xl bg-white/70 px-4 dark:divide-emerald-500/15 dark:bg-slate-900/40">
            {(result.details ?? []).map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                <dt className="text-slate-500 dark:text-slate-400">{item.label}</dt>
                <dd className="text-right font-semibold text-slate-900 dark:text-white">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {result && !result.verified ? (
        <section
          ref={resultRef}
          aria-labelledby="fake-heading"
          className="scroll-mt-20 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-lg shadow-red-600/5 dark:border-red-500/20 dark:bg-red-950/40"
        >
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 size-6 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
            <div className="flex-1">
              <h2 id="fake-heading" className="font-bold tracking-tight text-red-800 dark:text-red-300">
                {result.heading}
              </h2>
              <p className="mt-1 text-sm text-red-700/90 dark:text-red-300/80">
                {result.message}
              </p>
              <Button
                variant="outline"
                onClick={onReport}
                className="mt-3 h-10 rounded-xl border-red-300 bg-transparent text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
              >
                <Flag className="size-4" aria-hidden="true" />
                Report This Ticket
              </Button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
