import React, { useState } from 'react'
import { FaTrash, FaCheckCircle } from 'react-icons/fa'
import toast from 'react-hot-toast'
import StatusBadge from "./StatusBadge"

export default function TaskTable({ tasks, onEdit, onDelete, onMarkComplete, employeeNames, showActions = true, showEmployeeColumn = true, isHistory = false, isEmployeeView = false }) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)

  const handleMarkComplete = (task) => {
    if (onMarkComplete) {
      onMarkComplete(task)
      toast.success('Task marked as complete!')
    }
  }

  const handleDelete = (task) => {
    setTaskToDelete(task)
    setShowConfirmDialog(true)
  }

  const confirmDelete = () => {
    if (onDelete && taskToDelete) {
      // Immediate feedback - no waiting
      const taskId = taskToDelete.id
      
      // Close dialog immediately
      setShowConfirmDialog(false)
      setTaskToDelete(null)
      
      // Delete in background (toast will be shown by parent)
      onDelete(taskId)
    }
  }

  const cancelDelete = () => {
    setShowConfirmDialog(false)
    setTaskToDelete(null)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const formatTime = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const truncateText = (text, maxLength = 50) => {
    if (!text) return "-"
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p className="text-sm">No tasks found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Title</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Description</th>
            {showEmployeeColumn && <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">User</th>}
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Date</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Time</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Status</th>
            {showActions && <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const taskData = isHistory ? task.task : task
            const userData = isHistory ? task.profile : null
            const userName = isHistory 
              ? userData?.name || "Unknown"
              : task.assigned_to 
                ? employeeNames[task.assigned_to] || "Loading..." 
                : "Unassigned"
            
            // Time logic: Show creation/update time for pending tasks, completion/update time for completed tasks
            const dateToShow = isHistory 
              ? task.completed_at 
              : (taskData?.updated_at || task.updated_at || taskData?.completed_at || task.completed_at || taskData?.created_at || task.created_at)
            
            return (
              <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-sm text-gray-900">
                    {truncateText(taskData?.title, 30)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-600">
                    {truncateText(taskData?.description, 40)}
                  </div>
                </td>
                {showEmployeeColumn && (
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {userName}
                    </div>
                  </td>
                )}
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-600">
                    {formatDate(dateToShow)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-600">
                    {formatTime(dateToShow)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={isHistory ? "completed" : taskData?.status} />
                </td>
                {showActions && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isEmployeeView && taskData?.status !== 'completed' && (
                        <button
                          onClick={() => handleMarkComplete(task)}
                          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1"
                          title="Mark as complete"
                        >
                          <FaCheckCircle />
                          Complete
                        </button>
                      )}
                      {!isHistory && !isEmployeeView && (
                        <>
                          <button
                            onClick={() => onEdit && onEdit(task)}
                            disabled={taskData?.status === 'completed'}
                            className={`text-sm font-semibold px-2 py-1 rounded transition-colors ${
                              (taskData?.status === 'completed' || task.status === 'completed') 
                                ? 'text-gray-500 cursor-not-allowed' 
                                : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                            }`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(task)}
                            className="text-red-600 hover:text-red-800 text-sm font-semibold px-2 py-1 rounded hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      
      {/* Custom Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FaTrash className="text-red-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Task</h3>
                <p className="text-sm text-gray-600">Are you sure you want to delete this task?</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
