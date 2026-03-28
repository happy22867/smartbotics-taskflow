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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/80 shadow-sm backdrop-blur-md">
      <div className="flex h-20 w-full min-w-0 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 shrink items-center gap-3 sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-200/50">
            <span className="text-lg font-black tracking-tight text-white">TN</span>
          </div>
          <h1 className="truncate text-2xl font-black tracking-tight text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
            TaskNest
          </h1>
        </div>

        <div className="hidden min-w-0 shrink-0 items-center gap-3 md:flex md:gap-4">
          <div className="flex items-center gap-3 border-r border-gray-200 pr-4 md:pr-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50">
              <span className="text-sm font-bold text-indigo-700">{nameInitial}</span>
            </div>
            <div className="flex flex-col">
              <span className="max-w-[200px] truncate text-base font-medium text-gray-900 lg:max-w-xs">{userName}</span>
              <span className="text-xs font-medium text-indigo-600">{roleLabel}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 whitespace-nowrap rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-bold text-gray-600 shadow-sm transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            Log Out
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="shrink-0 rounded-xl border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 md:hidden"
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
        <div className="border-t border-gray-100 px-2 py-4 pb-6 md:hidden">
          <div className="mx-2 mb-4 flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100">
              <span className="text-sm font-bold text-indigo-700">{nameInitial}</span>
            </div>
            <div className="flex flex-col">
              <span className="truncate font-semibold text-gray-900">{userName}</span>
              <span className="text-xs font-medium text-indigo-600">{roleLabel}</span>
            </div>
          </div>
          <div className="px-2">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-xl border border-red-100 bg-red-50 px-6 py-3 text-base font-bold text-red-600 transition-colors hover:bg-red-100"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
