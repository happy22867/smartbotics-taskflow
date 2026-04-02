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
  
  // Description expand state
  const [expandedTasks, setExpandedTasks] = useState(new Set())

  const toggleExpand = (taskId) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

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
      <div className="text-center py-8 text-slate-400 bg-slate-800/50 rounded-xl border border-slate-700 border-dashed m-4">
        <p className="text-base font-medium">No tasks found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-800">
            {/* <th className="text-left px-6 py-4 text-base font-bold text-slate-200 uppercase tracking-wider text-xs">Title</th> */}
            <th className="text-left px-6 py-4 text-base font-bold text-slate-200 uppercase tracking-wider text-xs">Description</th>
            {showEmployeeColumn && <th className="text-left px-6 py-4 text-base font-bold text-slate-200 uppercase tracking-wider text-xs">User</th>}
            {/* <th className="text-left px-6 py-4 text-base font-bold text-slate-200 uppercase tracking-wider text-xs">Date</th> */}
            {/* <th className="text-left px-6 py-4 text-base font-bold text-slate-200 uppercase tracking-wider text-xs">Time</th> */}
            <th className="text-left px-6 py-4 text-base font-bold text-slate-200 uppercase tracking-wider text-xs">Status</th>
            {showActions && <th className="text-left px-6 py-4 text-base font-bold text-slate-200 uppercase tracking-wider text-xs">Actions</th>}
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
              <tr key={task.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                {/* <td className="px-6 py-4">
                  {editingTaskId === task.id ? (
                    <input 
                      type="text" 
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 text-base border border-slate-600 bg-slate-900 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none h-12 shadow-sm"
                    />
                  ) : (
                    <div className="font-bold text-base text-white">
                      {truncateText(taskData?.title, 30)}
                    </div>
                  )}
                </td> */}
                <td className="px-6 py-4">
                  {editingTaskId === task.id ? (
                    <textarea 
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-3 py-2 text-base border border-slate-600 bg-slate-900 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[80px] shadow-sm resize-y"
                    />
                  ) : (
                    <div className="text-base text-slate-400 font-medium">
                      {taskData?.description?.length > 40 ? (
                        <>
                          <span className="whitespace-pre-wrap">
                            {expandedTasks.has(task.id) 
                              ? taskData.description 
                              : truncateText(taskData.description, 40)}
                          </span>
                          <button 
                            onClick={() => toggleExpand(task.id)}
                            className="ml-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors focus:outline-none inline-flex items-center"
                          >
                            {expandedTasks.has(task.id) ? "Show less" : "Read more"}
                          </button>
                        </>
                      ) : (
                        <span className="whitespace-pre-wrap">{taskData?.description || "-"}</span>
                      )}
                    </div>
                  )}
                </td>
                {showEmployeeColumn && (
                  <td className="px-6 py-4">
                    {editingTaskId === task.id ? (
                      <select
                        value={editAssignedTo}
                        onChange={(e) => setEditAssignedTo(e.target.value)}
                        className="w-full px-3 py-2 text-base border border-slate-600 bg-slate-900 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none h-12 shadow-sm"
                      >
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-base font-semibold text-slate-200 bg-slate-700 px-3 py-1 inline-block rounded-full">
                        {userName}
                      </div>
                    )}
                  </td>
                )}
                {/* <td className="px-6 py-4">
                  <div className="text-base text-slate-300 font-medium">
                    {formatDate(dateToShow)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-base text-slate-300 font-medium">
                    {formatTime(dateToShow)}
                  </div>
                </td> */}
                <td className="px-6 py-4 relative">
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
                      <div className="absolute left-0 mt-1 w-32 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <button
                          onClick={() => {
                            onEdit({ ...taskData, status: 'completed' }, true)
                            setStatusMenuTaskId(null)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-emerald-400 hover:bg-slate-700 font-medium transition-colors flex items-center gap-2"
                        >
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          Complete
                        </button>
                        <button
                          onClick={() => {
                            onEdit({ ...taskData, status: 'new' }, true)
                            setStatusMenuTaskId(null)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-blue-400 hover:bg-slate-700 font-medium transition-colors flex items-center gap-2"
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          New
                        </button>
                        <button
                          onClick={() => setStatusMenuTaskId(null)}
                          className="w-full px-4 py-2 text-left text-sm text-slate-400 hover:bg-slate-700 transition-colors border-t border-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </td>
                {showActions && (
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {isEmployeeView && taskData?.status !== 'completed' && (
                        <button
                          onClick={() => handleMarkComplete(task)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition-colors text-base font-bold flex items-center gap-2 shadow-sm"
                          title="Mark as complete"
                        >
                          <FaCheckCircle className="text-lg" />
                          Complete
                        </button>
                      )}
                      {!isHistory && !isEmployeeView && (
                        <>
                          {editingTaskId === task.id ? (
                            <>
                              <button
                                onClick={() => handleUpdate(task)}
                                className="text-base font-bold px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all shadow-sm"
                              >
                                Update
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="text-base font-bold px-4 py-2 text-slate-200 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => startEditing(task)}
                              disabled={taskData?.status?.toLowerCase() === 'completed'}
                              className={`text-base font-bold px-4 py-2 rounded-lg transition-colors ${
                                (taskData?.status?.toLowerCase() === 'completed' || task.status?.toLowerCase() === 'completed') 
                                  ? 'text-slate-500 cursor-not-allowed bg-slate-800 border-transparent' 
                                  : 'text-indigo-300 bg-slate-700 hover:bg-slate-600 border border-slate-600 shadow-sm'
                              }`}
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(task)}
                            className="text-red-400 hover:text-red-300 text-base font-bold px-4 py-2 rounded-lg hover:bg-slate-600 bg-slate-700 border border-slate-600 transition-colors shadow-sm ml-1"
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
      
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <FaTrash className="text-red-500 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete Task</h3>
                <p className="text-sm text-slate-400">Are you sure you want to delete this task?</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
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
