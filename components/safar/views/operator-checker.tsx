'use client'

import { Bus, ChevronRight, Globe, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { getPopularSearches, searchOperators, toErrorMessage, type OperatorResult } from '@/lib/api'
import { ViewHeader } from '../view-header'

type Status = 'authorized' | 'unverified' | 'scam'

const statusStyles: Record<Status, { badge: string; label: string; avatar: string }> = {
  authorized: {
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    label: '✅ Authorized',
    avatar: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
  },
  unverified: {
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    label: '⚠️ Unverified',
    avatar: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  },
  scam: {
    badge: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
    label: '🚫 Flagged Scam Domain',
    avatar: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400',
  },
}

export function OperatorChecker() {
  const [query, setQuery] = useState('')
  const [popular, setPopular] = useState<string[]>([])
  const [results, setResults] = useState<OperatorResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getPopularSearches()
      .then((chips) => {
        if (!cancelled) setPopular(chips)
      })
      .catch((err) => {
        if (!cancelled) setError(toErrorMessage(err))
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(() => {
      setLoading(true)
      searchOperators(query.trim())
        .then((data) => {
          if (cancelled) return
          setResults(data.results)
          setError(null)
        })
        .catch((err) => {
          if (cancelled) return
          setResults([])
          setError(toErrorMessage(err))
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [query])

  return (
    <div className="flex flex-col gap-5">
      <ViewHeader
        title="Check Operator or Website"
        description="Verify if a booking site or bus operator is officially authorized."
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-black/5 dark:border-slate-700 dark:bg-slate-800/60">
        <label htmlFor="operator-search" className="sr-only">
          Search website or operator
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="operator-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter website URL or operator name..."
            className="h-12 w-full rounded-full bg-slate-100 pr-4 pl-12 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          Popular Searches
        </h2>
        <div className="flex flex-wrap gap-2">
          {popular.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setQuery(chip)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                query === chip
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
              )}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <section aria-label="Results" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Results</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {loading ? 'Loading…' : `${results.length} found`}
          </span>
        </div>
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        ) : !loading && results.length === 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-950/30 dark:text-amber-300">
            {`No records for "${query}". Treat unknown sites with caution and book only through official operator websites.`}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {results.map((op) => {
              const style = statusStyles[op.status]
              const Icon = op.isDomain ? Globe : Bus
              return (
                <li key={op.name}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-lg shadow-black/5 transition-transform active:scale-[0.99] dark:bg-slate-800/60"
                  >
                    <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-full', style.avatar)}>
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">{op.name}</span>
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', style.badge)}>
                          {style.label}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          {op.region}
                        </span>
                      </span>
                      <span className="truncate text-xs text-slate-500 dark:text-slate-400">{op.detail}</span>
                    </span>
                    <ChevronRight className="size-5 shrink-0 text-slate-300 dark:text-slate-600" aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
