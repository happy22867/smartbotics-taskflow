import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import TaskForm from "../components/TaskForm"
import Navbar from "../components/Navbar"
import StatusBadge from "../components/StatusBadge"
import EmptyState from "../components/EmptyState"
import TaskTable from "../components/TaskTable"
import { getAllTasks, getTaskHistory, updateTask, deleteTask, getCurrentUser, clearAuthToken, getEmployees, createTask } from "../api/client"
import toast from "react-hot-toast"

export default function ManagerDashboard() {
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [employeeNames, setEmployeeNames] = useState({})
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState("")
  const [filter, setFilter] = useState("today")
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [currentTab, setCurrentTab] = useState("manage")
  const [statsView, setStatsView] = useState("today")
  const [selectedEmployee, setSelectedEmployee] = useState("all")
  const navigate = useNavigate()
  const formRef = useRef(null)

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
          refreshData(false)
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

  const refreshData = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const [tasksData, historyData] = await Promise.all([
        getAllTasks(),
        getTaskHistory()
      ])
      setTasks(tasksData.tasks || [])
      setHistory(historyData.history || [])
    } catch (err) {
      console.error("Error refreshing data:", err)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const fetchTasks = async () => {
    refreshData(true)
  }

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees()
      setEmployees(data.employees || [])
    } catch (err) {
      console.error("Error fetching employees:", err)
    }
  }

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !newTaskAssignedTo) {
      toast.error("Please fill in title and assign to someone")
      return
    }
    
    try {
      await createTask(newTaskTitle, newTaskDescription, newTaskAssignedTo)
      toast.success("Task created successfully!")
      setNewTaskTitle("")
      setNewTaskDescription("")
      setNewTaskAssignedTo("")
      setShowAddForm(false)
      fetchHistory()
      refreshData(false)
    } catch (err) {
      console.error("Error:", err)
      toast.error(err.message || "Failed to create task")
    }
  }

  const handleEditTask = async () => {
    if (!newTaskTitle.trim() || !newTaskAssignedTo) {
      toast.error("Please fill in title and assign to someone")
      return
    }
    
    try {
      await updateTask(editingTask.id, newTaskTitle, newTaskDescription, newTaskAssignedTo)
      toast.success("Task updated successfully!")
      setNewTaskTitle("")
      setNewTaskDescription("")
      setNewTaskAssignedTo("")
      setEditingTask(null)
      setShowAddForm(false)
      fetchHistory()
      refreshData(false)
    } catch (err) {
      console.error("Error:", err)
      toast.error(err.message || "Failed to update task")
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
    let filtered = []

    if (filter === "today") {
      const todayStr = new Date().toDateString()
      // For today's tasks, include both pending tasks and completed tasks with history
      const todayPendingTasks = tasks.filter((t) => 
        t.status === "pending" && new Date(t.created_at).toDateString() === todayStr
      )
      
      // Get completed tasks from history for today and map to task structure
      const todayCompletedTasks = history.filter((h) => 
        new Date(h.completed_at).toDateString() === todayStr
      ).map(h => ({
        ...h.task,
        completed_at: h.completed_at,
        status: 'completed',
        assigned_to: h.task?.assigned_to
      }))
      
      filtered = [...todayPendingTasks, ...todayCompletedTasks]
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
          <div className="mb-6">
            <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">Dashboard</h2>
            <p className="text-lg text-gray-500 font-medium tracking-wide">Manage tasks and track employee progress</p>
          </div>

          <div className="flex flex-col gap-10">
            {/* Main Content Area */}
            <div className="w-full">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
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
                            <TaskTable 
                              tasks={filteredTasks} 
                              employeeNames={employeeNames}
                              showActions={true}
                              isHistory={false}
                              onEdit={(task) => {
                                setEditingTask(task)
                                setNewTaskTitle(task.title)
                                setNewTaskDescription(task.description || "")
                                setNewTaskAssignedTo(task.assigned_to)
                                setShowAddForm(true)
                                // Scroll to form after a short delay to ensure it's rendered
                                setTimeout(() => {
                                  formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                }, 100)
                              }}
                              onMarkComplete={(task) => {
                                console.log('Completing task:', task.id)
                                completeTask(task.id).then((response) => {
                                  console.log('Complete response:', response)
                                  const completionTime = response.completed_at || new Date().toISOString()
                                  
                                  // Update tasks with completion time
                                  setTasks(prevTasks => 
                                    prevTasks.map(t => 
                                      t.id === task.id 
                                        ? { ...t, status: 'completed', completed_at: completionTime }
                                        : t
                                    )
                                  )
                                  refreshData(false)
                                  toast.success('Task marked as complete!')
                                }).catch((err) => {
                                  console.error('Complete task error:', err)
                                  toast.error('Failed to complete task')
                                })
                              }}
                              onDelete={(taskId) => {
                                deleteTask(taskId).then(() => {
                                  refreshData(false)
                                  toast.success('Task deleted successfully!')
                                }).catch(console.error)
                              }}
                            />
                          )}
                        </div>
                      ) : null}
                    </div>
                    {/* Add Task Button at End */}
                    {!showHistory && (
                      <div className="mt-6 pl-4 pb-6">
                        {!showAddForm && (filter === "today" || filter === "pending") ? (
                          <div className="flex justify-start">
                            <button
                              onClick={() => setShowAddForm(true)}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                              </svg>
                              Add Task
                            </button>
                          </div>
                        ) : showAddForm ? (
                          <div ref={formRef} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <input
                                type="text"
                                placeholder="Task Title"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              <input
                                type="text"
                                placeholder="Task Description"
                                value={newTaskDescription}
                                onChange={(e) => setNewTaskDescription(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              <select
                                value={newTaskAssignedTo}
                                onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              >
                                <option value="">Select Employee</option>
                                {employees.map((emp) => (
                                  <option key={emp.id} value={emp.id}>
                                    {emp.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                              <button
                                onClick={() => {
                                  setShowAddForm(false)
                                  setNewTaskTitle("")
                                  setNewTaskDescription("")
                                  setNewTaskAssignedTo("")
                                  setEditingTask(null)
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={editingTask ? handleEditTask : handleAddTask}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                              >
                                {editingTask ? 'Update Task' : 'Add Task'}
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
