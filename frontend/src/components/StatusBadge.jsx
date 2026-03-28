export default function StatusBadge({ status }) {
  const isPending = status === "pending"
  
  return (
    <span 
      className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 border ${
        isPending 
          ? "bg-orange-50 text-orange-700 border-orange-200 shadow-sm"
          : "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
      }`}
    >
      <div className={`w-2 h-2 rounded-full ${isPending ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`}></div>
      {status === "pending" ? "Pending" : "Completed"}
    </span>
  )
}
