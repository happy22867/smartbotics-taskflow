import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import StatusBadge from "../components/StatusBadge"
import EmptyState from "../components/EmptyState"
import TaskTable from "../components/TaskTable"
import { getMyTasks, getAllTasks, getTaskHistory, getCurrentUser, clearAuthToken, completeTask, getEmployees } from "../api/client"

export default function EmployeeDashboard() {
  const [myTasks, setMyTasks] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState("")
  const [userId, setUserId] = useState("")
  const [filter, setFilter] = useState("my-pending")
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState("my-tasks")
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [statsView, setStatsView] = useState("today")
  const [selectedEmployee, setSelectedEmployee] = useState("all")
  const [employees, setEmployees] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (userId) {
      fetchHistory()
      fetchEmployees()
    }
  }, [userId])

  useEffect(() => {
    applyFilter()
  }, [myTasks, allTasks, filter, view, selectedEmployee])

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser()
      if (user.role !== "employee") {
        navigate("/manager")
        return
      }
      setUserName(user.name)
      setUserRole(user.role || "")
      setUserId(user.id)
      fetchTasks(user.id)
    } catch (err) {
      navigate("/")
    }
  }

  const fetchTasks = async (empId) => {
    setLoading(true)
    try {
      const myTasksData = await getMyTasks()
      const allTasksData = await getAllTasks()

      setMyTasks(myTasksData.tasks || [])
      setAllTasks(allTasksData.tasks || [])
    } catch (err) {
      console.error("Error fetching tasks:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees()
      setEmployees(data.employees || [])
    } catch (err) {
      console.error("Error fetching employees:", err)
    }
  }

  const applyFilter = () => {
    let filtered = []

    if (view === "my-tasks") {
      if (filter === "my-pending") {
        filtered = myTasks.filter((t) => t.status === "pending")
      } else if (filter === "my-completed") {
        return
      } else if (filter === "my-today") {
        const todayStr = new Date().toDateString()
        filtered = myTasks.filter((t) => new Date(t.created_at).toDateString() === todayStr)
      }
    } else {
      filtered = allTasks.filter((t) => t.assigned_to !== userId)
      
      // Apply employee filter for team tasks
      if (selectedEmployee !== "all") {
        filtered = filtered.filter((t) => t.assigned_to === selectedEmployee)
      }
    }

    setFilteredTasks(filtered)
  }

  const handleLogout = async () => {
    clearAuthToken()
    navigate("/")
  }

  const fetchHistory = async () => {
    try {
      const data = await getTaskHistory()
      setHistory(data.history || [])
    } catch (err) {
      console.error("Error fetching history:", err)
    }
  }

  // Set up global callbacks for table actions
  useEffect(() => {
    window.completeTaskCallback = (taskId) => {
      completeTask(taskId).then(() => fetchTasks(userId)).catch(console.error)
    }
    
    return () => {
      delete window.completeTaskCallback
    }
  }, [userId])

  const todayDate = new Date().toDateString()
  const todayTasks = myTasks.filter((t) => new Date(t.created_at).toDateString() === todayDate)

  const activeStats = statsView === "today" ? {
    label: "Today's",
    total: todayTasks.length,
    pending: todayTasks.filter((t) => t.status === "pending").length,
    completed: todayTasks.filter((t) => t.status === "completed").length,
  } : {
    label: "Total",
    total: myTasks.length,
    pending: myTasks.filter((t) => t.status === "pending").length,
    completed: myTasks.filter((t) => t.status === "completed").length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-gray-100">
      <Navbar userName={userName} userRole={userRole} onLogout={handleLogout} />

      <main className="pt-32 pb-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-12 overflow-visible">
            {/* bg-clip-text can clip descenders (e.g. "y"); extra leading + padding preserves tails */}
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.15] pb-1 text-transparent bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text mb-3">
              My Tasks
            </h2>
            <p className="text-xl text-gray-500 font-medium tracking-wide">Track and complete your assigned tasks</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Task Overview</h3>
              <p className="text-sm text-gray-500">Quick glance at your {statsView === "today" ? "today's metrics" : "all-time metrics"}</p>
            </div>
            <div className="bg-gray-100 p-1.5 rounded-xl inline-flex items-center shadow-inner">
              <button
                type="button"
                onClick={() => setStatsView("today")}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                  statsView === "today"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setStatsView("total")}
                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                  statsView === "total"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Total
              </button>
            </div>
          </div>

          {/* Same effective width as manager main column (sidebar ~w-72 + gap); page shell stays full width */}
          <div className="w-full max-w-5xl mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3 relative z-10">{activeStats.label} Tasks</p>
                <p className="text-5xl font-black text-gray-900 relative z-10 tabular-nums">{activeStats.total}</p>
              </div>
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3 relative z-10">{activeStats.label} Pending</p>
                <p className="text-5xl font-black text-orange-600 relative z-10 tabular-nums">{activeStats.pending}</p>
              </div>
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3 relative z-10">{activeStats.label} Completed</p>
                <p className="text-5xl font-black text-emerald-600 relative z-10 tabular-nums">{activeStats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 mb-12 overflow-hidden">
            {/* Primary Filter Tabs */}
            <div className="border-b border-gray-200 bg-white">
              <nav className="flex px-6 sm:px-8 -mb-px space-x-8">
                <button
                  onClick={() => {
                    setView("my-tasks")
                    setShowHistory(false)
                  }}
                  className={`py-5 text-sm font-bold border-b-2 transition-colors duration-200 whitespace-nowrap ${
                    view === "my-tasks" && !showHistory
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    My Tasks
                  </span>
                </button>
                <button
                  onClick={() => {
                    setView("all-tasks")
                    setShowHistory(false)
                    setSelectedEmployee("all")
                  }}
                  className={`py-5 text-sm font-bold border-b-2 transition-colors duration-200 whitespace-nowrap ${
                    view === "all-tasks" && !showHistory
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    Team Tasks
                  </span>
                </button>
              </nav>
            </div>

            {/* Secondary Filters */}
            {view === "my-tasks" && !showHistory && (
              <div className="bg-gray-50/80 border-b border-gray-100 px-6 sm:px-8 py-4 flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-500 mr-2">Filter by:</span>
                <div className="bg-gray-200/50 p-1 rounded-lg inline-flex">
                  <button
                    type="button"
                    onClick={() => setFilter("my-today")}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200 ${
                      filter === "my-today"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setFilter("my-pending")}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200 ${
                      filter === "my-pending"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => {
                      setFilter("my-completed")
                      setShowHistory(true)
                      fetchHistory()
                    }}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200 ${
                      filter === "my-completed" && showHistory
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    History
                  </button>
                </div>
              </div>
            )}

            {/* Employee Filter for Team Tasks */}
            {view === "all-tasks" && !showHistory && (
              <div className="bg-gray-50/80 border-b border-gray-100 px-6 sm:px-8 py-4 flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-500 mr-2">Filter by Employee:</span>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="all">All Team Members</option>
                  {employees.filter(emp => emp.id !== userId).map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="p-8">
              {view === "my-tasks" && filter === "my-completed" && showHistory ? (
                history.length === 0 ? (
                  <EmptyState title="No completed tasks" description="Tasks you complete will appear here" />
                ) : (
                  <TaskTable 
                    tasks={history} 
                    employeeNames={{}}
                    showActions={false}
                    isHistory={true}
                  />
                )
              ) : filteredTasks.length === 0 ? (
                <EmptyState 
                  title={view === "all-tasks" ? "No team tasks" : filter === "my-today" ? "No tasks today" : "No tasks"} 
                  description={
                    view === "all-tasks"
                      ? "Team tasks will appear here"
                      : filter === "my-today"
                        ? "You have no tasks assigned for today yet"
                        : "Your assigned tasks will appear here"
                  }
                />
              ) : (
                <TaskTable 
                  tasks={filteredTasks} 
                  employeeNames={{}}
                  showActions={view === "my-tasks"}
                  isHistory={false}
                  isEmployeeView={true}
                  onMarkComplete={(task) => {
                    completeTask(task.id).then(() => {
                      fetchTasks(userId)
                      toast.success('Task marked as complete!')
                    }).catch(console.error)
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
