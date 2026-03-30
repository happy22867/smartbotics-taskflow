export default function StatusBadge({ status, onClick, canChange = false }) {
  const isPending = status === "pending"
  const isNew = status === "new"
  const isCompleted = status === "completed"

  const getStyle = () => {
    if (isNew) return "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
    if (isPending) return "bg-orange-50 text-orange-700 border-orange-200 shadow-sm"
    return "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
  }

  const getDotStyle = () => {
    if (isNew) return "bg-blue-500 animate-pulse"
    if (isPending) return "bg-orange-500 animate-pulse"
    return "bg-emerald-500"
  }

  return (
    <span 
      onClick={canChange ? onClick : undefined}
      className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 border ${getStyle()} ${canChange ? 'cursor-pointer hover:shadow-md transition-all active:scale-95' : ''}`}
    >
      <div className={`w-2 h-2 rounded-full ${getDotStyle()}`}></div>
      {status === "pending" ? "Pending" : status === "new" ? "New" : "Completed"}
    </span>
  )
}
