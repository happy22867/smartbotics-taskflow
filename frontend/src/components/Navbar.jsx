import { useNavigate } from "react-router-dom"
import { useState } from "react"

export default function Navbar({ userName, onLogout }) {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await onLogout()
    navigate("/")
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200/50">
              <span className="text-white font-black text-xl">TF</span>
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">TaskFlow</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-3 pr-6 border-r border-gray-200">
              <div className="w-9 h-9 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100">
                <span className="text-indigo-700 font-bold">{userName.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-base text-gray-600 font-medium">
                {userName}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 shadow-sm"
            >
              Log Out
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-2 bg-gray-50 rounded-xl mx-2 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-700 font-bold">{userName.charAt(0).toUpperCase()}</span>
              </div>
              <span className="font-semibold text-gray-900">{userName}</span>
            </div>
            <div className="px-2">
              <button
                onClick={handleLogout}
                className="w-full px-6 py-3 text-base font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
