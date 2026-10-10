export function ViewHeader({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <div className="mb-5">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-balance text-slate-900 dark:text-white">
          {title}
        </h1>
        {children}
      </div>
      <p className="mt-1 text-sm text-pretty text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  )
}
