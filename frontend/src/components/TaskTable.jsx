import React from 'react'
import { FaTrash, FaCheckCircle } from 'react-icons/fa'
import toast from 'react-hot-toast'
import StatusBadge from "./StatusBadge"

export default function TaskTable({ tasks, onEdit, onDelete, onMarkComplete, employeeNames, showActions = true, showEmployeeColumn = true, isHistory = false, isEmployeeView = false }) {
  const handleMarkComplete = (task) => {
    if (onMarkComplete) {
      onMarkComplete(task)
      toast.success('Task marked as complete!')
    }
  }

  const handleDelete = (task) => {
    if (onDelete) {
      if (window.confirm('Are you sure you want to delete this task?')) {
        onDelete(task.id)
        toast.success('Task deleted successfully!')
      }
    }
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
      <div className="text-center py-8 text-gray-500">
        <p>No tasks found</p>
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
            
            const dateToShow = isHistory ? task.completed_at : taskData?.created_at
            
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
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
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
    </div>
  )
}
