export default function StatusBadge({ status, onClick, canChange = false }) {
  const isPending = status === "pending"
  const isNew = status === "new"
  const isCompleted = status === "completed"

  const getStyle = () => {
    if (isNew) return "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-sm"
    if (isPending) return "bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-sm"
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm"
  }

  const getDotStyle = () => {
    if (isNew) return "bg-blue-500 animate-pulse"
    if (isPending) return "bg-orange-500 animate-pulse"
    return "bg-emerald-500"
  }

  return (
    <span 
      onClick={canChange ? onClick : undefined}
      className={`px-5 py-2 rounded-full text-sm font-bold uppercase tracking-widest flex items-center gap-2.5 border ${getStyle()} ${canChange ? 'cursor-pointer hover:shadow-md transition-all active:scale-95' : ''}`}
    >
      <div className={`w-2.5 h-2.5 rounded-full ${getDotStyle()}`}></div>
      {status === "pending" ? "Pending" : status === "new" ? "New" : "Completed"}
    </span>
  )
}
