'use client'

import { BadgeCheck, FlagTriangleRight, Radio, ScanLine } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TabId = 'verify' | 'operator' | 'report' | 'alerts'

const tabs = [
  { id: 'verify', label: 'Verify', icon: ScanLine },
  { id: 'operator', label: 'Check Operator', icon: BadgeCheck },
  { id: 'report', label: 'Report', icon: FlagTriangleRight },
  { id: 'alerts', label: 'Live Alerts', icon: Radio },
] as const

export function BottomNav({
  activeTab,
  onChange,
}: {
  activeTab: TabId
  onChange: (tab: TabId) => void
}) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] border-t border-white/20 bg-white/70 pb-[env(safe-area-inset-bottom)] backdrop-blur-md dark:border-white/5 dark:bg-slate-900/70"
    >
      <ul className="grid grid-cols-4">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex w-full flex-col items-center gap-1 px-1 pt-3 pb-2.5 text-[11px] font-medium transition-colors',
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0 h-1 w-8 rounded-b-full bg-indigo-600 transition-opacity dark:bg-indigo-400',
                    isActive ? 'opacity-100' : 'opacity-0',
                  )}
                  aria-hidden="true"
                />
                <Icon className="size-5" strokeWidth={isActive ? 2.4 : 2} aria-hidden="true" />
                <span className="truncate">{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
