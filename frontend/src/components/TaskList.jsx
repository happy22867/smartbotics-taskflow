import { useState, useEffect } from "react"
import { completeTask, deleteTask, getEmployees } from "../api/client"
import StatusBadge from "./StatusBadge"
import toast from "react-hot-toast"

export default function TaskList({ tasks, onTaskUpdate, onTaskDelete, onTaskEdit, isEmployee = false, isOtherEmployeeTasks = false }) {
  const [employeeNames, setEmployeeNames] = useState({})
  const [readTasks, setReadTasks] = useState(() => {
    const saved = localStorage.getItem("read_task_ids")
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    fetchEmployeeNames()
  }, [tasks])

  const fetchEmployeeNames = async () => {
    try {
      const data = await getEmployees()
      const names = {}
      if (data.employees) {
        data.employees.forEach((emp) => {
          names[emp.id] = emp.name
        })
      }
      setEmployeeNames(names)
    } catch (err) {
      console.error("Failed to load employee names in TaskList")
    }
  }

  const markAsRead = (taskId) => {
    if (!readTasks.includes(taskId)) {
      const updated = [...readTasks, taskId]
      setReadTasks(updated)
      localStorage.setItem("read_task_ids", JSON.stringify(updated))
    }
  }

  const handleCompleteTask = async (taskId, e) => {
    e.stopPropagation()
    try {
      await completeTask(taskId)
      toast.success("Task marked as completed!")
      onTaskUpdate()
    } catch (err) {
      console.error("Exception:", err)
      toast.error("Error completing task")
    }
  }

  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation()
    if (window.confirm("Are you sure you want to permanently delete this task?")) {
      try {
        await deleteTask(taskId)
        toast.success("Task deleted successfully")
        onTaskDelete()
      } catch (err) {
        console.error("Error:", err)
        toast.error("Failed to delete task")
      }
    }
  }

  if (tasks.length === 0) {
    return null
  }

  const todayDate = new Date().toDateString()

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {tasks.map((task) => {
        const isCreatedToday = new Date(task.created_at).toDateString() === todayDate
        const isUnreadNewTask = isCreatedToday && !readTasks.includes(task.id) && isEmployee && !isOtherEmployeeTasks

        return (
          <div 
            key={task.id} 
            onClick={() => isUnreadNewTask && markAsRead(task.id)}
            className={`bg-white border rounded-2xl p-6 sm:p-8 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-xl ${
              isUnreadNewTask 
                ? "border-indigo-200 ring-4 ring-indigo-50 shadow-md cursor-pointer" 
                : "border-gray-100 shadow-sm"
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="font-extrabold text-xl sm:text-2xl text-gray-900 tracking-tight">{task.title}</h4>
                  {isUnreadNewTask && (
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm animate-pulse flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                      NEW
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100">{task.description}</p>
                )}
                
                <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm sm:text-base font-medium text-gray-500">
                  <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 text-xs">👤</span>
                    </div>
                    {employeeNames[task.assigned_to] || "Unknown"}
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-xs">📅</span>
                    </div>
                    {new Date(task.created_at).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="flex flex-row lg:flex-col items-center lg:items-end gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100">
                <StatusBadge status={task.status} />
                
                <div className="flex gap-2 w-full sm:w-auto">
                  {isEmployee && task.status === "pending" && !isOtherEmployeeTasks && (
                    <button
                      onClick={(e) => handleCompleteTask(task.id, e)}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-base font-bold rounded-xl shadow-lg shadow-green-200 transition-all duration-200 transform hover:scale-105"
                    >
                      Complete Task
                    </button>
                  )}

                  {!isEmployee && task.status === "pending" && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); onTaskEdit(task); }}
                        className="px-6 py-2.5 bg-white border-2 border-indigo-100 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200 text-sm font-bold rounded-xl transition-all duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleDeleteTask(task.id, e)}
                        className="px-6 py-2.5 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 text-sm font-bold rounded-xl transition-all duration-200"
                      >
                        Delete
                      </button>
                    </>
                  )}

                  {!isEmployee && task.status === "completed" && (
                    <button
                      onClick={(e) => handleDeleteTask(task.id, e)}
                      className="px-6 py-2.5 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 text-sm font-bold rounded-xl transition-all duration-200"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
