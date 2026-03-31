import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { loginUser, setAuthToken } from "../api/client"
import toast from "react-hot-toast"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const data = await loginUser(email, password)

      if (!data.user) {
        throw new Error("Invalid email or password")
      }

      setAuthToken(data.session.access_token)

      if (data.user.role === "manager") {
        toast.success("Welcome back, Manager!")
        navigate("/manager")
      } else if (data.user.role === "employee") {
        toast.success("Welcome back!")
        navigate("/employee")
      } else {
        throw new Error("Invalid role")
      }
    } catch (err) {
      let errorMessage = "Login failed"
      
      if (err.message === "Failed to fetch") {
        errorMessage = "Network error. Please check your connection."
      } else if (err.message && err.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password"
      } else if (err.message && err.message.includes("Invalid email or password")) {
        errorMessage = "Invalid email or password"
      } else if (err.message && err.message.includes("Invalid role")) {
        errorMessage = "Invalid user role"
      } else if (err.message && err.message.includes("Please confirm your email address")) {
        errorMessage = "Please confirm your email address"
      } else if (err.message && err.message.includes("User not found")) {
        errorMessage = "User not found"
      } else if (err.message) {
        errorMessage = err.message
      } else if (err.detail) {
        errorMessage = err.detail
      } else {
        errorMessage = "An unexpected error occurred. Please try again."
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 text-slate-200 rounded-3xl shadow-2xl p-10 border border-slate-700 transition-all hover:shadow-indigo-500/10 duration-300">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30 transform transition hover:scale-105 duration-200">
              <span className="text-white font-black text-3xl tracking-tight">TN</span>
            </div>
            <h1 className="text-5xl font-black text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text mb-3 tracking-tight">TaskNest</h1>
            <p className="text-xl text-slate-400 font-medium">SmartBotics Task Management</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-base font-bold text-slate-200 mb-3">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-lg bg-slate-900 text-slate-200 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-base font-bold text-slate-200 mb-3">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-4 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-lg bg-slate-900 text-slate-200 placeholder-slate-500"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg mt-4"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-base">
              Don't have an account?{" "}
              <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}