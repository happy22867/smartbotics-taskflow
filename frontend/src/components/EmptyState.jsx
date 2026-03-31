export default function EmptyState({ title, description }) {
  return (
    <div className="text-center py-10 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed m-6">
      <svg className="mx-auto h-16 w-16 text-indigo-400 mb-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-base text-slate-400 font-medium">{description}</p>
    </div>
  )
}
