import { useNavigate } from "react-router-dom"
import { useState } from "react"

export default function Navbar({ userName, userRole, onLogout }) {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const nameInitial = userName ? userName.charAt(0).toUpperCase() : "?"
  const roleLabel = userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : ""

  const handleLogout = async () => {
    await onLogout()
    navigate("/")
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-900/80 shadow-sm backdrop-blur-md">
      <div className="flex h-20 w-full min-w-0 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 shrink items-center gap-3 sm:gap-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30">
            <span className="text-xl font-black tracking-tight text-white">TN</span>
          </div>
          <h1 className="truncate text-3xl font-black tracking-tight text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text">
            TaskNest
          </h1>
        </div>

        <div className="hidden min-w-0 shrink-0 items-center gap-4 md:flex md:gap-6">
          <div className="flex items-center gap-4 border-r border-slate-700 pr-5 md:pr-8">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-slate-800">
              <span className="text-base font-bold text-indigo-400">{nameInitial}</span>
            </div>
            <div className="flex flex-col">
              <span className="max-w-[200px] truncate text-lg font-bold text-white lg:max-w-xs">{userName}</span>
              <span className="text-sm font-semibold text-indigo-400 uppercase tracking-wide">{roleLabel}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 whitespace-nowrap rounded-xl border border-slate-700 bg-slate-800 px-6 py-2.5 text-base font-bold text-slate-300 shadow-sm transition-all duration-200 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 hover:shadow"
          >
            Log Out
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="shrink-0 rounded-xl border border-slate-700 p-2 text-slate-300 transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 md:hidden"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-slate-800 px-2 py-4 pb-6 md:hidden">
          <div className="mx-2 mb-4 flex items-center gap-3 rounded-xl bg-slate-800 px-4 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700">
              <span className="text-sm font-bold text-indigo-400">{nameInitial}</span>
            </div>
            <div className="flex flex-col">
              <span className="truncate font-semibold text-white">{userName}</span>
              <span className="text-xs font-medium text-indigo-400">{roleLabel}</span>
            </div>
          </div>
          <div className="px-2">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-3 text-base font-bold text-red-400 transition-colors hover:bg-red-500/20"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
