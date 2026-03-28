import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import TaskForm from "../components/TaskForm"
import Navbar from "../components/Navbar"
import StatusBadge from "../components/StatusBadge"
import EmptyState from "../components/EmptyState"
import TaskTable from "../components/TaskTable"
import { getAllTasks, getTaskHistory, updateTask, deleteTask, getCurrentUser, clearAuthToken, getEmployees } from "../api/client"

export default function ManagerDashboard() {
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [employeeNames, setEmployeeNames] = useState({})
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState("")
  const [filter, setFilter] = useState("today")
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

  // Set up global callbacks for table actions
  useEffect(() => {
    window.editTaskCallback = (task) => {
      setEditingTask(task)
      setCurrentTab("create")
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
    
    window.deleteTaskCallback = (taskId) => {
      if(window.confirm("Delete this task?")) {
        deleteTask(taskId).then(() => {
          fetchTasks()
          toast.success('Task deleted successfully!')
        }).catch(console.error)
      }
    }
    
    return () => {
      delete window.editTaskCallback
      delete window.deleteTaskCallback
    }
  }, [])

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

          <div className="flex flex-col gap-10">
            {/* Main Content Area */}
            <div className="w-full">
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
                            <TaskTable 
                              tasks={getFilteredHistory()} 
                              employeeNames={employeeNames}
                              showActions={false}
                              isHistory={true}
                            />
                          )}
                        </div>
                      ) : filter === "today" || filter === "pending" ? (
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                              <h3 className="text-xl font-bold text-gray-900">{getTaskTitle()}</h3>
                              <button
                                onClick={() => {
                                  setEditingTask(null)
                                  setCurrentTab("create")
                                }}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                Add Task
                              </button>
                            </div>
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
                            <TaskTable 
                              tasks={filteredTasks} 
                              employeeNames={employeeNames}
                              showActions={true}
                              isHistory={false}
                              onEdit={(task) => {
                                setEditingTask(task)
                                setCurrentTab("create")
                                window.scrollTo({ top: 0, behavior: "smooth" })
                              }}
                              onDelete={(taskId) => {
                                deleteTask(taskId).then(() => {
                                  fetchTasks()
                                  toast.success('Task deleted successfully!')
                                }).catch(console.error)
                              }}
                            />
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
            </div>

            {/* Task Form Modal */}
            {currentTab === "create" && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100/50 p-0 max-w-3xl w-full max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                          {editingTask ? "Edit Task" : "Create New Task"}
                        </h2>
                        <p className="text-indigo-100 text-sm">
                          {editingTask ? "Update the task details below" : "Fill in the details to create a new task"}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setCurrentTab("manage")
                          setEditingTask(null)
                        }}
                        className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Modal Body */}
                  <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <TaskForm
                      onTaskCreated={() => {
                        setCurrentTab("manage")
                        setEditingTask(null)
                        fetchTasks()
                      }}
                      editingTask={editingTask}
                      onEditComplete={() => {
                        setCurrentTab("manage")
                        setEditingTask(null)
                        fetchTasks()
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
