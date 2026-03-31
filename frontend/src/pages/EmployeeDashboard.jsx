import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import StatusBadge from "../components/StatusBadge"
import EmptyState from "../components/EmptyState"
import TaskTable from "../components/TaskTable"
import { getMyTasks, getAllTasks, getTaskHistory, getCurrentUser, clearAuthToken, completeTask, getEmployees } from "../api/client"
import toast from "react-hot-toast"

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
  const [employeeNames, setEmployeeNames] = useState({})
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

  const refreshData = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const [myTasksData, allTasksData, historyData] = await Promise.all([
        getMyTasks(),
        getAllTasks(),
        getTaskHistory()
      ])

      setMyTasks(myTasksData.tasks || [])
      setAllTasks(allTasksData.tasks || [])
      
      const userHistory = (historyData.history || []).filter(h => h.profile?.id === userId)
      setHistory(userHistory)
    } catch (err) {
      console.error("Error refreshing data:", err)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const fetchTasks = async (empId) => {
    refreshData(true)
  }

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees()
      setEmployees(data.employees || [])
      
      // Create employee names mapping
      const names = {}
      data.employees.forEach(emp => {
        names[emp.id] = emp.name
      })
      setEmployeeNames(names)
    } catch (err) {
      console.error("Error fetching employees:", err)
    }
  }

  const applyFilter = () => {
    let filtered = []

    if (view === "my-tasks") {
      if (filter === "my-pending") {
        filtered = myTasks.filter((t) => t.status === "pending" || t.status === "new")
      } else if (filter === "my-completed") {
        filtered = myTasks.filter((t) => t.status === "completed")
      } else if (filter === "my-today") {
        const todayStr = new Date().toDateString()
        // For today's tasks, include both pending tasks and completed tasks with history
        const todayPendingTasks = myTasks.filter((t) => 
          (t.status === "pending" || t.status === "new") && parseDateSafe(t.created_at).toDateString() === todayStr
        )
        
        // Get ANY completed tasks from history for today (even if created earlier)
        const todayCompletedTasks = history.filter((h) => 
          parseDateSafe(h.completed_at).toDateString() === todayStr
        ).map(h => ({
          ...h.task,
          completed_at: h.completed_at,
          status: 'completed',
          assigned_to: h.task?.assigned_to || userId
        }))
        
        filtered = [...todayPendingTasks, ...todayCompletedTasks]
      }
    } else {
      // Team Tasks filters
      if (filter === "team-today") {
        // Team Tasks - show only today's tasks for other employees
        const todayStr = new Date().toDateString()
        filtered = allTasks.filter((t) => 
          t.assigned_to !== userId && 
          parseDateSafe(t.created_at).toDateString() === todayStr
        )
      } else if (filter === "team-total") {
        // Team Tasks - show all tasks for other employees
        filtered = allTasks.filter((t) => t.assigned_to !== userId)
      } else {
        // Default to today's tasks for backward compatibility
        const todayStr = new Date().toDateString()
        filtered = allTasks.filter((t) => 
          t.assigned_to !== userId && 
          parseDateSafe(t.created_at).toDateString() === todayStr
        )
      }
      
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
      // Filter history to show only current user's tasks
      const userHistory = (data.history || []).filter(h => h.profile?.id === userId)
      setHistory(userHistory)
    } catch (err) {
      console.error("Error fetching history:", err)
    }
  }

  // Set up global callbacks for table actions
  useEffect(() => {
    window.completeTaskCallback = (taskId) => {
      completeTask(taskId).then(() => refreshData(false)).catch(console.error)
    }
    
    return () => {
      delete window.completeTaskCallback
    }
  }, [userId])

  const parseDateSafe = (dateStr) => {
    if (!dateStr) return new Date("");
    return new Date(dateStr + (!dateStr.includes('Z') && !dateStr.includes('+') ? 'Z' : ''));
  };

  const todayDate = new Date().toDateString()
  const todayTasks = myTasks.filter((t) => parseDateSafe(t.created_at).toDateString() === todayDate)

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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <Navbar userName={userName} userRole={userRole} onLogout={handleLogout} />

      <main className="pt-24 pb-12">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-6">
            <h2 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-3 leading-tight tracking-tight">My Tasks</h2>
            <p className="text-xl text-slate-400 font-medium tracking-wide">Track and complete your assigned tasks</p>
          </div>

          <div className="w-full">
          </div>

          <div className="bg-slate-800 rounded-3xl shadow-xl border border-slate-700 mb-12 overflow-hidden">
            {/* Primary Filter Tabs */}
            <div className="border-b border-slate-700 bg-slate-800">
              <nav className="flex px-6 sm:px-8 -mb-px space-x-8">
                <button
                  onClick={() => {
                    setView("my-tasks")
                    setShowHistory(false)
                  }}
                  className={`py-5 text-base font-bold border-b-[3px] transition-colors duration-200 whitespace-nowrap ${
                    view === "my-tasks"
                      ? "border-indigo-400 text-indigo-300 bg-slate-700/50 px-4"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600 px-4"
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
                    setFilter("team-today")
                  }}
                  className={`py-5 text-base font-bold border-b-[3px] transition-colors duration-200 whitespace-nowrap ${
                    view === "all-tasks"
                      ? "border-indigo-400 text-indigo-300 bg-slate-700/50 px-4"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600 px-4"
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
            {view === "my-tasks" && (
              <div className="bg-slate-800/80 border-b border-slate-700 px-6 sm:px-8 py-5 flex items-center gap-4">
                <span className="text-base font-bold text-slate-300 mr-2">Filter by:</span>
                <div className="bg-slate-900/50 p-1.5 rounded-xl inline-flex gap-1">
                  <button
                    type="button"
                    onClick={() => setFilter("my-today")}
                    className={`px-5 py-2.5 rounded-lg text-base font-bold transition-all duration-300 ${
                      filter === "my-today"
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/30"
                        : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setFilter("my-pending")}
                    className={`px-5 py-2.5 rounded-lg text-base font-bold transition-all duration-300 ${
                      filter === "my-pending"
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/30"
                        : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
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
                    className={`px-5 py-2.5 rounded-lg text-base font-bold transition-all duration-300 ${
                      filter === "my-completed" && showHistory
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/30"
                        : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                    }`}
                  >
                    History
                  </button>
                </div>
              </div>
            )}

            {/* Employee Filter for Team Tasks */}
            {view === "all-tasks" && (
              <div className="bg-slate-800/80 border-b border-slate-700 px-6 sm:px-8 py-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <span className="text-base font-bold text-slate-300 mr-2">Filter by Employee:</span>
                    <select
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="px-5 py-3 border border-slate-600 rounded-xl text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-900 text-slate-200 min-w-[200px]"
                    >
                      <option value="all">All Team Members</option>
                      {employees.filter(emp => emp.id !== userId).map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-base font-bold text-slate-300 mr-2">Time Period:</span>
                    <div className="bg-slate-900/50 p-1.5 rounded-xl inline-flex gap-1">
                      <button
                        type="button"
                        onClick={() => setFilter("team-today")}
                        className={`px-5 py-2.5 rounded-lg text-base font-bold transition-all duration-300 ${
                          filter === "team-today"
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/30"
                            : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                        }`}
                      >
                        Today
                      </button>
                      <button
                        onClick={() => setFilter("team-total")}
                        className={`px-5 py-2.5 rounded-lg text-base font-bold transition-all duration-300 ${
                          filter === "team-total"
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/30"
                            : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                        }`}
                      >
                        Total
                      </button>
                    </div>
                  </div>
                </div>
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
                    showEmployeeColumn={false}
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
                  employeeNames={employeeNames}
                  showActions={view === "my-tasks"}
                  isHistory={false}
                  isEmployeeView={true}
                  showEmployeeColumn={view === "all-tasks"}
                  onMarkComplete={(task) => {
                    console.log('Employee completing task:', task.id)
                    completeTask(task.id).then(() => {
                      refreshData(false)
                      toast.success('Task marked as complete!')
                    }).catch((err) => {
                      console.error('Employee complete task error:', err)
                      toast.error('Failed to complete task')
                    })
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
