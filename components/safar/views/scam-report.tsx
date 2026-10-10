'use client'

import { AlertTriangle, CheckCircle2, IndianRupee, Link2, Send, UploadCloud } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitReport, toErrorMessage } from '@/lib/api'
import { ViewHeader } from '../view-header'

export function ScamReport() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [reference, setReference] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    setLoading(true)
    setError(null)
    try {
      const result = await submitReport(data)
      setReference(result.reference)
      setMessage(result.message)
      form.reset()
      setFileName(null)
    } catch (err) {
      setError(toErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (reference) {
    return (
      <div className="flex flex-col gap-5">
        <ViewHeader title="Report a Scam" description="Help protect other commuters in South Chennai." />
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-lg shadow-black/5 dark:border-emerald-500/20 dark:bg-emerald-950/40">
          <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white">
            <CheckCircle2 className="size-7" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-emerald-800 dark:text-emerald-300">Report submitted</h2>
          <p className="text-sm text-emerald-700/90 dark:text-emerald-300/80">
            {message ?? `Reference #${reference}. Our team will review it within 24 hrs and alert nearby commuters if confirmed.`}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setReference(null)
              setMessage(null)
              setFileName(null)
              setError(null)
            }}
            className="mt-2 h-10 rounded-xl"
          >
            Submit another report
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <ViewHeader title="Report a Scam" description="Help protect other commuters in South Chennai." />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-lg shadow-black/5 dark:bg-slate-800/60"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="portal-url">Fake Portal / Website URL</Label>
          <div className="relative">
            <Link2 className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input
              id="portal-url"
              name="portal_url"
              type="url"
              placeholder="https://..."
              className="h-12 rounded-xl pl-10"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="impersonated">Bus Operator Name (if impersonated)</Label>
          <Input
            id="impersonated"
            name="impersonated"
            placeholder="e.g. Kallada Travels"
            className="h-12 rounded-xl px-4"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="amount">Amount Lost (optional)</Label>
          <div className="relative">
            <IndianRupee className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input
              id="amount"
              name="amount"
              inputMode="numeric"
              placeholder="0"
              className="h-12 rounded-xl pl-10"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-900 dark:text-white">UPI Payment Screenshot</span>
          <label
            htmlFor="screenshot"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-8 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-slate-600 dark:bg-slate-900/50 dark:hover:border-indigo-500"
          >
            <UploadCloud className="size-8 text-indigo-500" aria-hidden="true" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {fileName ?? 'Tap to upload screenshot'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG up to 5MB</span>
          </label>
          <input
            id="screenshot"
            name="screenshot"
            type="file"
            accept="image/png,image/jpeg"
            className="sr-only"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Describe what happened</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Explain how the scam occurred..."
            className="min-h-28 rounded-xl px-4 py-3"
          />
        </div>

        <div className="flex gap-3 rounded-xl border border-amber-200 bg-gradient-to-r from-red-50 to-amber-50 p-3.5 dark:border-amber-500/20 dark:from-red-950/40 dark:to-amber-950/40">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            Your report helps flag fraudulent portals for other travelers. Reports are reviewed within 24 hrs.
          </p>
        </div>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
        ) : null}

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-red-600 text-base font-semibold text-white hover:bg-red-700"
        >
          <Send className="size-5" aria-hidden="true" />
          {loading ? 'Submitting…' : 'Submit Scam Report'}
        </Button>
      </form>
    </div>
  )
}
