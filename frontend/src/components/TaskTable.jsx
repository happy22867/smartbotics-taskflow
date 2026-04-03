import React, { useState } from 'react'
import { FaTrash, FaCheckCircle, FaEdit } from 'react-icons/fa'
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
  const [editPriority, setEditPriority] = useState("")
  const [editNotes, setEditNotes] = useState("")
  
  // Status change specific state
  const [statusMenuTaskId, setStatusMenuTaskId] = useState(null)
  
  // Description and Notes expand state
  const [expandedTasks, setExpandedTasks] = useState(new Set())
  const [expandedNotes, setExpandedNotes] = useState(new Set())

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

  const toggleExpandNotes = (taskId) => {
    setExpandedNotes(prev => {
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
    setEditPriority(taskData?.priority || "P3")
    setEditNotes(taskData?.notes || "")
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
        status: taskData?.status || "pending",
        priority: editPriority,
        notes: editNotes
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

  const truncateText = (text, maxLength = 40) => {
    if (!text) return "-"
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P1': return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'P2': return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
      case 'P3': return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'P4': return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 bg-slate-800/50 rounded-xl border border-slate-700 border-dashed m-4">
        <p className="text-base font-medium">No tasks found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto pb-24">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-800">
            <th className="text-left px-4 py-3 text-sm font-bold text-slate-200 uppercase tracking-wider">Description</th>
            <th className="text-left px-4 py-3 text-sm font-bold text-slate-200 uppercase tracking-wider">Priority</th>
            {showEmployeeColumn && <th className="text-left px-4 py-3 text-sm font-bold text-slate-200 uppercase tracking-wider">Owner</th>}
            <th className="text-left px-4 py-3 text-sm font-bold text-slate-200 uppercase tracking-wider">Notes</th>
            {isHistory && (
              <>
                <th className="text-left px-4 py-3 text-sm font-bold text-slate-200 uppercase tracking-wider whitespace-nowrap">Created</th>
                <th className="text-left px-4 py-3 text-sm font-bold text-slate-200 uppercase tracking-wider whitespace-nowrap">Completed</th>
              </>
            )}
            <th className="text-left px-4 py-3 text-sm font-bold text-slate-200 uppercase tracking-wider">Status</th>
            {showActions && <th className="text-left px-4 py-3 text-sm font-bold text-slate-200 uppercase tracking-wider">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const isHistoricalRecord = isHistory && task.task !== undefined
            const taskData = isHistoricalRecord ? task.task : task
            const userData = isHistoricalRecord ? task.profile : null
            const userName = isHistoricalRecord 
              ? userData?.name || "Unknown"
              : task.assigned_to 
                ? employeeNames[task.assigned_to] || "Loading..." 
                : "Unassigned"
            
            return (
              <tr key={task.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-2.5">
                  {editingTaskId === task.id ? (
                    <textarea 
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-slate-600 bg-slate-900 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[60px] shadow-sm resize-y"
                    />
                  ) : (
                    <div className="text-sm text-slate-400 font-medium">
                      {taskData?.description?.length > 40 ? (
                        <>
                          <span className="whitespace-pre-wrap">
                            {expandedTasks.has(task.id) 
                              ? taskData.description 
                              : truncateText(taskData.description, 40)}
                          </span>
                          <button 
                            onClick={() => toggleExpand(task.id)}
                            className="ml-2 text-indigo-400 hover:text-indigo-300 text-xs font-semibold transition-colors focus:outline-none inline-flex items-center"
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
                <td className="px-4 py-2.5">
                  {editingTaskId === task.id ? (
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-slate-600 bg-slate-900 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none h-9 shadow-sm"
                    >
                      <option value="P1">P1</option>
                      <option value="P2">P2</option>
                      <option value="P3">P3</option>
                      <option value="P4">P4</option>
                    </select>
                  ) : (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityColor(taskData?.priority || 'P3')}`}>
                      {taskData?.priority || 'P3'}
                    </span>
                  )}
                </td>
                {showEmployeeColumn && (
                  <td className="px-4 py-2.5">
                    {editingTaskId === task.id ? (
                      <select
                        value={editAssignedTo}
                        onChange={(e) => setEditAssignedTo(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-slate-600 bg-slate-900 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none h-9 shadow-sm"
                      >
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-xs font-semibold text-slate-200 bg-slate-700/50 px-2.5 py-0.5 inline-block rounded-full border border-slate-600/50">
                        {userName}
                      </div>
                    )}
                  </td>
                )}
                <td className="px-4 py-2.5">
                  {editingTaskId === task.id ? (
                    <input 
                      type="text" 
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-slate-600 bg-slate-900 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none h-9 shadow-sm"
                      placeholder="Notes"
                    />
                  ) : (
                    <div className="text-sm text-slate-400 font-medium italic">
                      {taskData?.notes?.length > 40 ? (
                        <>
                          <span className="whitespace-pre-wrap">
                            {expandedNotes.has(task.id) 
                              ? taskData.notes 
                              : truncateText(taskData.notes, 40)}
                          </span>
                          <button 
                            onClick={() => toggleExpandNotes(task.id)}
                            className="ml-2 text-indigo-400 hover:text-indigo-300 text-xs font-semibold transition-colors focus:outline-none inline-flex items-center"
                          >
                            {expandedNotes.has(task.id) ? "Show less" : "Read more"}
                          </button>
                        </>
                      ) : (
                        <span className="whitespace-pre-wrap">{taskData?.notes || "-"}</span>
                      )}
                    </div>
                  )}
                </td>
                {isHistory && (
                  <>
                    <td className="px-4 py-2.5">
                      <div className="text-xs text-slate-400 font-medium whitespace-nowrap">
                        {formatDate(taskData?.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-xs text-slate-400 font-medium whitespace-nowrap">
                        {taskData?.status?.toLowerCase() === 'completed'
                          ? formatDate(taskData?.completed_at || (isHistoricalRecord ? task.completed_at : null) || taskData?.updated_at)
                          : '-'}
                      </div>
                    </td>
                  </>
                )}
                <td className={`px-4 py-2.5 relative ${statusMenuTaskId === task.id ? 'z-50' : 'z-20'}`}>
                  <StatusBadge 
                    status={taskData?.status} 
                    canChange={!isEmployeeView && !isHistory && (taskData?.status?.toLowerCase() === 'pending' || taskData?.status?.toLowerCase() === 'new')}
                    onClick={() => {
                      setStatusMenuTaskId(task.id)
                    }}
                  />
                  
                  {statusMenuTaskId === task.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setStatusMenuTaskId(null)}
                      />
                      <div className="absolute left-0 top-full mt-1 w-32 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                        <button
                          onClick={() => {
                            onEdit({ ...taskData, status: 'completed' }, true)
                            setStatusMenuTaskId(null)
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs text-emerald-400 hover:bg-slate-700 font-bold transition-colors flex items-center gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          Complete
                        </button>
                        <button
                          onClick={() => {
                            onEdit({ ...taskData, status: 'new' }, true)
                            setStatusMenuTaskId(null)
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs text-blue-400 hover:bg-slate-700 font-bold transition-colors flex items-center gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                          New
                        </button>
                      </div>
                    </>
                  )}
                </td>
                {showActions && (
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {isEmployeeView && taskData?.status !== 'completed' && (
                        <button
                          onClick={() => handleMarkComplete(task)}
                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition-colors text-xs font-bold flex items-center gap-1.5 shadow-sm"
                          title="Mark as complete"
                        >
                          <FaCheckCircle />
                          Complete
                        </button>
                      )}
                      {!isHistory && !isEmployeeView && (
                        <>
                          {editingTaskId === task.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleUpdate(task)}
                                className="text-xs font-bold px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all shadow-sm whitespace-nowrap"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="text-xs font-bold px-3 py-1.5 text-slate-200 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                              >
                                X
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditing(task)}
                              disabled={taskData?.status?.toLowerCase() === 'completed'}
                              className={`text-xs font-bold p-2 rounded-lg transition-colors flex items-center justify-center ${
                                (taskData?.status?.toLowerCase() === 'completed' || task.status?.toLowerCase() === 'completed') 
                                  ? 'text-slate-500 cursor-not-allowed bg-slate-800' 
                                  : 'text-indigo-300 bg-slate-700 hover:bg-slate-600 border border-slate-600/50 shadow-sm'
                              }`}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(task)}
                            className="text-red-400 hover:text-red-300 text-xs font-bold p-2 rounded-lg hover:bg-slate-600 bg-slate-700 border border-slate-600/50 transition-colors shadow-sm flex items-center justify-center"
                            title="Delete"
                          >
                            <FaTrash />
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
          <div className="bg-slate-800 rounded-xl shadow-2xl p-5 max-w-sm w-full mx-4 transform transition-all border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                <FaTrash className="text-red-500 text-lg" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Delete Task</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm"
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
