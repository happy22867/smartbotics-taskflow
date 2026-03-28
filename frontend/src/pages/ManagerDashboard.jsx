import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import TaskForm from "../components/TaskForm"
import EmployeeDropZone from "../components/EmployeeDropZone"
import Navbar from "../components/Navbar"
import StatusBadge from "../components/StatusBadge"
import EmptyState from "../components/EmptyState"
import { getAllTasks, getTaskHistory, updateTask, deleteTask, getCurrentUser, clearAuthToken, getEmployees } from "../api/client"

export default function ManagerDashboard() {
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [employeeNames, setEmployeeNames] = useState({})
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState("")
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [editingTask, setEditingTask] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [currentTab, setCurrentTab] = useState("manage")
  const [statsView, setStatsView] = useState("today")
  const [selectedEmployee, setSelectedEmployee] = useState("all")
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
    fetchTasks()
    fetchEmployees()
    fetchHistory()
  }, [])

  useEffect(() => {
    const names = {}
    employees.forEach((emp) => {
      names[emp.id] = emp.name
    })
    setEmployeeNames(names)
  }, [employees])

  useEffect(() => {
    if (showHistory) {
      fetchHistory()
    }
  }, [showHistory])

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser()
      if (user.role !== "manager") {
        navigate("/employee")
        return
      }
      setUserName(user.name)
      setUserRole(user.role || "")
    } catch (err) {
      navigate("/")
    }
  }

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const data = await getAllTasks()
      setTasks(data.tasks || [])
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

  const todayDate = new Date().toDateString()
  const todayTasks = tasks.filter((t) => new Date(t.created_at).toDateString() === todayDate)

  const activeStats = statsView === "today" ? {
    label: "Today's",
    total: todayTasks.length,
    pending: todayTasks.filter((t) => t.status === "pending").length,
    completed: todayTasks.filter((t) => t.status === "completed").length,
    employees: employees.length,
  } : {
    label: "Total",
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    employees: employees.length,
  }

  const getFilteredTasks = () => {
    let filtered = tasks

    if (filter === "today") {
      const today = new Date().toDateString()
      filtered = tasks.filter(
        (t) => new Date(t.created_at).toDateString() === today
      )
    } else if (filter === "pending") {
      filtered = tasks.filter((t) => t.status === "pending")
    } else if (filter === "completed") {
      filtered = tasks.filter((t) => t.status === "completed")
    }

    // Apply employee filter
    if (selectedEmployee !== "all") {
      filtered = filtered.filter((t) => t.assigned_to === selectedEmployee)
    }

    return filtered
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

  const filteredTasks = getFilteredTasks()
  const employeesWithTasks = employees.map(emp => ({
    ...emp,
    tasks: tasks.filter(t => t.assigned_to === emp.id),
    taskCount: tasks.filter(t => t.assigned_to === emp.id).length
  }))

  const getFilteredHistory = () => {
    let filtered = history
    
    // Apply employee filter
    if (selectedEmployee !== "all") {
      filtered = filtered.filter((h) => h.profile?.id === selectedEmployee)
    }
    
    return filtered
  }

  const getTaskTitle = () => {
    if (filter === "today") return "Today's Tasks"
    if (filter === "pending") return "Pending Tasks"
    if (filter === "completed") return "Completed Tasks"
    return "All Tasks"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-gray-100">
      <Navbar userName={userName} userRole={userRole} onLogout={handleLogout} />

      <main className="pt-32 pb-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-12">
            <h2 className="text-4xl sm:text-5xl font-black bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4 tracking-tight">Dashboard</h2>
            <p className="text-xl text-gray-500 font-medium tracking-wide">Manage tasks and track employee progress</p>
          </div>

          <div className="flex flex-col md:flex-row gap-10">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-72 flex-shrink-0">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sticky top-32 transition-all duration-300">
                <nav className="space-y-2">
                  <button
                    onClick={() => setCurrentTab("manage")}
                    className={`w-full text-left px-6 py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center gap-4 ${
                      currentTab === "manage"
                        ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-200 transform scale-[1.02]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                    Manage Tasks
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab("create")
                      setEditingTask(null)
                    }}
                    className={`w-full text-left px-6 py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center gap-4 ${
                      currentTab === "create"
                        ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-200 transform scale-[1.02]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                    Create Task
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              
              {currentTab === "create" && (
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="mb-8 border-b border-gray-100 pb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {editingTask ? "Edit Task" : "Create New Task"}
                    </h2>
                    <p className="text-gray-600">
                      {editingTask ? "Update the details for this task." : "Fill out the details below to add a new task to the system."}
                    </p>
                  </div>
                  
                  {editingTask ? (
                    <TaskForm
                      onTaskCreated={() => {
                        setEditingTask(null)
                        fetchTasks()
                        setCurrentTab("manage")
                      }}
                      editingTask={editingTask}
                      onEditComplete={() => {
                        setEditingTask(null)
                        fetchTasks()
                        setCurrentTab("manage")
                      }}
                    />
                  ) : (
                    <TaskForm onTaskCreated={() => {
                      fetchTasks()
                      setCurrentTab("manage")
                    }} />
                  )}
                </div>
              )}

              {currentTab === "manage" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {/* Stats Grid Header & Toggle */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Task Overview</h3>
                      <p className="text-sm text-gray-500">Quick glance at {statsView === "today" ? "today's metrics" : "all-time metrics"}</p>
                    </div>
                    <div className="bg-gray-100 p-1.5 rounded-xl flex items-center shadow-inner inline-flex">
                      <button
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

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 transform transition-all duration-300 hover:scale[1.02] hover:shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                      <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3 relative z-10">{activeStats.label} Tasks</p>
                      <p className="text-5xl font-black text-gray-900 relative z-10">{activeStats.total}</p>
                    </div>
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 transform transition-all duration-300 hover:scale[1.02] hover:shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                      <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3 relative z-10">{activeStats.label} Pending</p>
                      <p className="text-5xl font-black text-orange-600 relative z-10">{activeStats.pending}</p>
                    </div>
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 transform transition-all duration-300 hover:scale[1.02] hover:shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                      <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3 relative z-10">{activeStats.label} Completed</p>
                      <p className="text-5xl font-black text-emerald-600 relative z-10">{activeStats.completed}</p>
                    </div>
                  </div>

                  {/* Tasks Container */}
                  <div className="bg-white rounded-2xl shadow-md border border-gray-100">
                    <div className="border-b border-gray-100 p-6 sm:p-8">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setFilter("all")
                            setShowHistory(false)
                            setSelectedEmployee("all")
                          }}
                          className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                            filter === "all" && !showHistory
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          All Tasks
                        </button>
                        <button
                          onClick={() => {
                            setFilter("today")
                            setShowHistory(false)
                            setSelectedEmployee("all")
                          }}
                          className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                            filter === "today" && !showHistory
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Today
                        </button>
                        <button
                          onClick={() => {
                            setFilter("pending")
                            setShowHistory(false)
                            setSelectedEmployee("all")
                          }}
                          className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                            filter === "pending" && !showHistory
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => {
                            setShowHistory(true)
                            fetchHistory()
                            setSelectedEmployee("all")
                          }}
                          className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                            showHistory
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          History
                        </button>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8">
                      {showHistory ? (
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Task History</h3>
                            <div className="flex items-center gap-3">
                              <label className="text-sm font-medium text-gray-700">Filter by Employee:</label>
                              <select
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                              >
                                <option value="all">All Employees</option>
                                {employees.map((emp) => (
                                  <option key={emp.id} value={emp.id}>
                                    {emp.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          {getFilteredHistory().length === 0 ? (
                            <EmptyState title="No completed tasks" description="Tasks completed by employees will appear here" />
                          ) : (
                            <div className="space-y-4">
                              {getFilteredHistory().map((h) => (
                                <div key={h.id} className="bg-gray-50 border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all duration-200">
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex-1">
                                      <h4 className="font-bold text-base text-gray-900 mb-1">{h.task?.title}</h4>
                                      {h.task?.description && (
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{h.task.description}</p>
                                      )}
                                      <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                          <span className="text-sm">👤</span>
                                          {h.profile?.name}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                          <span className="text-sm">✓</span>
                                          {new Date(h.completed_at).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                    <StatusBadge status="completed" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : filter === "today" || filter === "pending" ? (
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <h3 className="text-xl font-bold text-gray-900">{getTaskTitle()}</h3>
                            <div className="flex items-center gap-3">
                              <label className="text-sm font-medium text-gray-700">Filter by Employee:</label>
                              <select
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                              >
                                <option value="all">All Employees</option>
                                {employees.map((emp) => (
                                  <option key={emp.id} value={emp.id}>
                                    {emp.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          {filteredTasks.length === 0 ? (
                            <EmptyState title={`No ${filter} tasks`} description={`No ${filter} tasks to display`} />
                          ) : (
                            <div className="space-y-4">
                              {filteredTasks.map((task) => (
                                <div key={task.id} className="bg-gray-50 border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all duration-200">
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex-1">
                                      <h4 className="font-bold text-base text-gray-900 mb-1">{task.title}</h4>
                                      {task.description && (
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                                      )}
                                      <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                          <span className="text-sm">👤</span>
                                          {task.assigned_to ? employeeNames[task.assigned_to] || "Loading..." : "Unassigned"}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                          <span className="text-sm">📅</span>
                                          {new Date(task.created_at).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-3 sm:mt-0">
                                      <StatusBadge status={task.status} />
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => {
                                            setEditingTask(task)
                                            setCurrentTab("create")
                                            window.scrollTo({ top: 0, behavior: "smooth" })
                                          }}
                                          className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => {
                                            if(window.confirm("Delete this task?")) {
                                              deleteTask(task.id).then(() => fetchTasks()).catch(console.error)
                                            }
                                          }}
                                          className="text-red-600 hover:text-red-800 text-sm font-semibold px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Assign Tasks to Employees</h3>
                            <p className="text-gray-500 text-sm">Drag tasks from the left panel to assign them directly to your team members.</p>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Draggable Unassigned Tasks */}
                            <div className="lg:col-span-5 xl:col-span-4">
                              <h4 className="text-base font-bold text-gray-900 mb-4 px-1">Available Tasks</h4>
                              <div className="space-y-3 max-h-[600px] overflow-y-auto bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                {filteredTasks.filter(t => !t.assigned_to).length === 0 ? (
                                  <div className="text-center py-12 px-4">
                                    <p className="text-gray-500 text-sm font-medium">No unassigned tasks</p>
                                    <p className="text-gray-400 text-xs mt-1">All available tasks have been assigned</p>
                                  </div>
                                ) : (
                                  filteredTasks.filter(t => !t.assigned_to).map((task) => (
                                    <div
                                      key={task.id}
                                      draggable
                                      onDragStart={(e) => {
                                        e.dataTransfer.effectAllowed = "move"
                                        e.dataTransfer.setData("taskId", task.id)
                                      }}
                                      className="bg-white border border-gray-200 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-indigo-400 transition-all duration-200"
                                    >
                                      <h5 className="font-semibold text-gray-900 text-sm mb-1.5">{task.title}</h5>
                                      {task.description && (
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{task.description}</p>
                                      )}
                                      <div className="mt-3 flex justify-between items-center">
                                        <span className="px-2.5 py-1 bg-yellow-50 border border-yellow-100 text-yellow-700 rounded-md text-[10px] uppercase font-bold tracking-wider">
                                          Unassigned
                                        </span>
                                        <div className="flex gap-1.5">
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault()
                                              e.stopPropagation()
                                              setEditingTask(task)
                                              setCurrentTab("create")
                                              window.scrollTo({ top: 0, behavior: "smooth" })
                                            }}
                                            className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold px-2 py-1 rounded hover:bg-indigo-50"
                                          >
                                            Edit
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Drop Zone */}
                            <div className="lg:col-span-7 xl:col-span-8">
                              <EmployeeDropZone
                                employees={employeesWithTasks}
                                onTaskAssigned={() => fetchTasks()}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
