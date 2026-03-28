import { useState, useEffect } from "react"
import { completeTask, deleteTask, getEmployees } from "../api/client"
import StatusBadge from "./StatusBadge"
import toast from "react-hot-toast"

export default function TaskList({
  tasks,
  onTaskUpdate,
  onTaskDelete,
  onTaskEdit,
  isEmployee = false,
  isOtherEmployeeTasks = false,
  hideCreatedDate = false,
}) {
  const [employeeNames, setEmployeeNames] = useState({})

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

  const showAssignee = !isEmployee || isOtherEmployeeTasks

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-xl shadow-sm"
        >
          <div className="flex flex-col lg:flex-row lg:items-stretch gap-6">
            <div className={`flex-1 min-w-0 flex gap-4 ${hideCreatedDate ? "flex-col" : "flex-col sm:flex-row sm:items-start"}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="font-extrabold text-xl sm:text-2xl text-gray-900 tracking-tight">{task.title}</h4>
                </div>
                {task.description && (
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100">{task.description}</p>
                )}

                {showAssignee && (
                  <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm sm:text-base font-medium text-gray-500">
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 text-xs">👤</span>
                      </div>
                      {employeeNames[task.assigned_to] || "Unknown"}
                    </div>
                  </div>
                )}
              </div>

              {!hideCreatedDate && (
                <div className="shrink-0 sm:w-36 lg:w-32 flex sm:flex-col sm:items-end justify-end sm:justify-start pt-1">
                  <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2 text-right w-full sm:w-auto">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Created</p>
                    <p className="text-xs font-semibold text-gray-600 leading-tight">
                      {new Date(task.created_at).toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-row lg:flex-col items-center lg:items-end gap-4 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 lg:min-w-[11rem]">
              <StatusBadge status={task.status} />

              <div className="flex gap-2 w-full sm:w-auto justify-end">
                {isEmployee && task.status === "pending" && !isOtherEmployeeTasks && (
                  <button
                    type="button"
                    onClick={(e) => handleCompleteTask(task.id, e)}
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-200/80 transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Mark as complete
                  </button>
                )}

                {!isEmployee && task.status === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onTaskEdit(task); }}
                      className="px-6 py-2.5 bg-white border-2 border-indigo-100 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200 text-sm font-bold rounded-xl transition-all duration-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteTask(task.id, e)}
                      className="px-6 py-2.5 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 text-sm font-bold rounded-xl transition-all duration-200"
                    >
                      Delete
                    </button>
                  </>
                )}

                {!isEmployee && task.status === "completed" && (
                  <button
                    type="button"
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
      ))}
    </div>
  )
}
