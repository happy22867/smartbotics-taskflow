import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { signupUser } from "../api/client"
import toast from "react-hot-toast"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState("employee")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!name.trim()) {
        throw new Error("Name is required")
      }

      await signupUser(email, password, name, role)
      
      toast.success("Signup successful! Please log in.")
      navigate("/")
    } catch (err) {
      toast.error(err.message || "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-slate-800 text-slate-200 rounded-3xl shadow-2xl p-10 border border-slate-700 transition-all hover:shadow-indigo-500/10 duration-300">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30 transform transition hover:scale-105 duration-200">
              <span className="text-white font-black text-3xl tracking-tight">TN</span>
            </div>
            <h1 className="text-5xl font-black text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text mb-3 tracking-tight">TaskNest</h1>
            <p className="text-xl text-slate-400 font-medium">Create your account</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-base font-bold text-slate-200 mb-3">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-5 py-4 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-lg bg-slate-900 text-slate-200 placeholder-slate-500"
              />
            </div>

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

            <div>
              <label className="block text-base font-bold text-slate-200 mb-3">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-5 py-4 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-lg bg-slate-900 text-slate-200"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg mt-4"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-base">
              Already have an account?{" "}
              <Link to="/" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}