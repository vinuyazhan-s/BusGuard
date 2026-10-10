import { Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ViewHeader } from '../view-header'

const pins = [
  { label: 'Tambaram', className: 'top-[70%] left-[20%]' },
  { label: 'Chrompet', className: 'top-[44%] left-[40%]' },
  { label: 'Kelambakkam', className: 'top-[88%] left-[66%]' },
  { label: 'Tirusulam', className: 'top-[38%] left-[70%]' },
]

const alerts: {
  severity: 'danger' | 'warning'
  title: string
  time: string
  location: string
  verified: boolean
}[] = [
  {
    severity: 'danger',
    title: "🚫 Fake portal 'tnbus-onlinebooking.in' impersonating TNSTC — 12 reports",
    time: '2 hours ago',
    location: 'Tambaram',
    verified: true,
  },
  {
    severity: 'warning',
    title: "⚠️ Unverified WhatsApp agent selling 'discounted' Kallada tickets",
    time: '5 hours ago',
    location: 'Chrompet',
    verified: false,
  },
  {
    severity: 'danger',
    title: "🚫 Fake UPI QR code circulated for 'Rathimeena' bookings",
    time: 'Yesterday',
    location: 'Kelambakkam',
    verified: true,
  },
  {
    severity: 'danger',
    title: "🚫 Cloned website 'srmtravels-booking.com' taking payments, no tickets issued",
    time: 'Yesterday',
    location: 'Tirusulam',
    verified: true,
  },
  {
    severity: 'warning',
    title: '⚠️ Suspicious Telegram channel offering bulk bus ticket discounts',
    time: '2 days ago',
    location: 'Pallavaram',
    verified: false,
  },
]

export function LiveAlerts() {
  return (
    <div className="flex flex-col gap-5">
      <ViewHeader
        title="Live Alerts — South Chennai"
        description="Recently reported fake portals & scam attempts near you."
      >
        <span className="mt-1.5 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold tracking-wider text-red-700 dark:bg-red-500/15 dark:text-red-300">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-red-500" />
          </span>
          LIVE
        </span>
      </ViewHeader>

      <div
        role="img"
        aria-label="Map of South Chennai showing scam hotspots at Tambaram, Chrompet, Kelambakkam and Tirusulam"
        className="relative h-40 overflow-hidden rounded-2xl bg-slate-200 shadow-lg shadow-black/5 dark:bg-slate-800"
        style={{
          backgroundImage: 'radial-gradient(circle, rgb(100 116 139 / 0.35) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}
      >
        <svg className="absolute inset-0 size-full" viewBox="0 0 400 160" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 110 C 80 90, 140 130, 220 100 S 340 60, 400 80" fill="none" stroke="rgb(99 102 241 / 0.35)" strokeWidth="3" />
          <path d="M60 0 C 90 60, 120 100, 150 160" fill="none" stroke="rgb(148 163 184 / 0.6)" strokeWidth="2" />
          <path d="M260 0 C 250 50, 290 110, 320 160" fill="none" stroke="rgb(148 163 184 / 0.6)" strokeWidth="2" />
        </svg>
        <div className="absolute inset-y-0 right-0 w-10 bg-sky-300/40 dark:bg-sky-500/20" aria-hidden="true" />
        {pins.map((pin) => (
          <div key={pin.label} className={cn('absolute flex -translate-x-1/2 -translate-y-full flex-col items-center', pin.className)}>
            <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-slate-800 shadow-sm dark:bg-slate-900/90 dark:text-slate-100">
              {pin.label}
            </span>
            <MapPin className="size-6 fill-red-500 text-white drop-shadow" aria-hidden="true" />
          </div>
        ))}
        <span className="absolute bottom-2 left-2 rounded-md bg-white/80 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-900/80 dark:text-slate-300">
          4 active hotspots
        </span>
      </div>

      <section aria-label="Alert feed">
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Recent reports</h2>
        <ul className="flex flex-col gap-3">
          {alerts.map((alert) => (
            <li
              key={alert.title}
              className={cn(
                'rounded-xl border-l-4 bg-white p-4 shadow-lg shadow-black/5 dark:bg-slate-800/60',
                alert.severity === 'danger' ? 'border-red-500' : 'border-amber-500',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm leading-snug font-semibold text-slate-900 dark:text-white">{alert.title}</p>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    alert.verified
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
                  )}
                >
                  {alert.verified ? 'Verified Report' : 'Under Review'}
                </span>
              </div>
              <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {alert.time}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {alert.location}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
