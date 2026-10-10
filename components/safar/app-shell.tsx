'use client'

import { useState } from 'react'
import { AppHeader } from './app-header'
import { BottomNav, type TabId } from './bottom-nav'
import { TicketVerifier } from './views/ticket-verifier'
import { OperatorChecker } from './views/operator-checker'
import { ScamReport } from './views/scam-report'
import { LiveAlerts } from './views/live-alerts'

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('verify')

  function handleTabChange(tab: TabId) {
    setActiveTab(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <div className="relative mx-auto flex min-h-screen max-w-[480px] flex-col bg-slate-50 shadow-2xl shadow-black/10 dark:bg-slate-900">
        <AppHeader />
        <main
          key={activeTab}
          className="flex-1 px-4 pt-4 pb-28 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {activeTab === 'verify' && (
            <TicketVerifier onReport={() => handleTabChange('report')} />
          )}
          {activeTab === 'operator' && <OperatorChecker />}
          {activeTab === 'report' && <ScamReport />}
          {activeTab === 'alerts' && <LiveAlerts />}
        </main>
        <BottomNav activeTab={activeTab} onChange={handleTabChange} />
      </div>
    </div>
  )
}
