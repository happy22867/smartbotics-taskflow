import React, { useState } from 'react'
import { FaTrash, FaCheckCircle } from 'react-icons/fa'
import toast from 'react-hot-toast'
import StatusBadge from "./StatusBadge"

export default function TaskTable({ tasks, onEdit, onDelete, onMarkComplete, employeeNames, employees = [], showActions = true, showEmployeeColumn = true, isHistory = false, isEmployeeView = false }) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  
  // Inline editing state
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editAssignedTo, setEditAssignedTo] = useState("")
  
  // Status change specific state
  const [statusMenuTaskId, setStatusMenuTaskId] = useState(null)

  const startEditing = (task) => {
    const taskData = isHistory ? task.task : task
    setEditingTaskId(task.id)
    setEditTitle(taskData?.title || "")
    setEditDescription(taskData?.description || "")
    setEditAssignedTo(taskData?.assigned_to || "")
  }

  const cancelEditing = () => {
    setEditingTaskId(null)
  }

  const handleUpdate = (currentTask) => {
    if (onEdit) {
      const taskData = isHistory ? currentTask.task : currentTask
      onEdit({
        id: currentTask.id,
        title: editTitle,
        description: editDescription,
        assigned_to: editAssignedTo,
        status: taskData?.status || "pending"
      }, true) // Pass true to indicate it's an inline update
    }
    setEditingTaskId(null)
  }

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

  const parseDate = (dateString) => {
    if (!dateString) return null
    // If string lacks timezone info (Z or +/-), assume UTC for consistency with server data
    let str = dateString
    if (str && !str.includes('Z') && !str.includes('+') && str.includes('T')) {
      str += 'Z'
    }
    return new Date(str)
  }

  const formatDate = (dateString) => {
    const date = parseDate(dateString)
    if (!date || isNaN(date)) return "N/A"
    return date.toLocaleDateString([], { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  const formatTime = (dateString) => {
    const date = parseDate(dateString)
    if (!date || isNaN(date)) return "N/A"
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
                  {editingTaskId === task.id ? (
                    <input 
                      type="text" 
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-2 py-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none h-10"
                    />
                  ) : (
                    <div className="font-medium text-sm text-gray-900">
                      {truncateText(taskData?.title, 30)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingTaskId === task.id ? (
                    <input 
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-2 py-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none h-10"
                    />
                  ) : (
                    <div className="text-sm text-gray-600">
                      {truncateText(taskData?.description, 40)}
                    </div>
                  )}
                </td>
                {showEmployeeColumn && (
                  <td className="px-4 py-3">
                    {editingTaskId === task.id ? (
                      <select
                        value={editAssignedTo}
                        onChange={(e) => setEditAssignedTo(e.target.value)}
                        className="w-full px-2 py-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none h-10"
                      >
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-sm text-gray-900">
                        {userName}
                      </div>
                    )}
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
                <td className="px-4 py-3 relative">
                  <StatusBadge 
                    status={isHistory ? "completed" : taskData?.status} 
                    canChange={!isEmployeeView && !isHistory && (taskData?.status?.toLowerCase() === 'pending' || taskData?.status?.toLowerCase() === 'new')}
                    onClick={() => {
                      console.log("Opening status menu for task:", task.id)
                      setStatusMenuTaskId(task.id)
                    }}
                  />
                  
                  {statusMenuTaskId === task.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setStatusMenuTaskId(null)}
                      />
                      <div className="absolute left-0 mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-100 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <button
                          onClick={() => {
                            onEdit({ ...taskData, status: 'completed' }, true)
                            setStatusMenuTaskId(null)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50 font-medium transition-colors flex items-center gap-2"
                        >
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          Complete
                        </button>
                        <button
                          onClick={() => {
                            onEdit({ ...taskData, status: 'new' }, true)
                            setStatusMenuTaskId(null)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-blue-700 hover:bg-blue-50 font-medium transition-colors flex items-center gap-2"
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          New
                        </button>
                        <button
                          onClick={() => setStatusMenuTaskId(null)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-400 hover:bg-gray-50 transition-colors border-t border-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
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
                          {editingTaskId === task.id ? (
                            <>
                              <button
                                onClick={() => handleUpdate(task)}
                                className="text-sm font-semibold px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                Update
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="text-sm font-semibold px-2 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => startEditing(task)}
                              disabled={taskData?.status?.toLowerCase() === 'completed'}
                              className={`text-sm font-semibold px-2 py-1 rounded transition-colors ${
                                (taskData?.status?.toLowerCase() === 'completed' || task.status?.toLowerCase() === 'completed') 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                              }`}
                            >
                              Edit
                            </button>
                          )}
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
