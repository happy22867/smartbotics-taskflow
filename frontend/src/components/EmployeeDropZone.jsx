import { useState } from "react"
import { updateTask } from "../api/client"

export default function EmployeeDropZone({ employees, onTaskAssigned }) {
  const [draggedTask, setDraggedTask] = useState(null)
  const [expandedIds, setExpandedIds] = useState(new Set())

  const handleDragStart = (e, taskId) => {
    setDraggedTask(taskId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (e, employeeId) => {
    e.preventDefault()
    e.stopPropagation()
    
    const taskId = e.dataTransfer.getData("taskId")
    
    if (!taskId) return

    try {
      await updateTask(taskId, null, null, employeeId, null)
      setDraggedTask(null)
      if (typeof onTaskAssigned === 'function') {
        onTaskAssigned()
      }
    } catch (err) {
      console.error("Error assigning task:", err)
      alert("Error assigning task")
    }
  }

  const toggleExpanded = (employeeId) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId)
      } else {
        newSet.add(employeeId)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-bold text-gray-900 mb-4">Employees</h4>
      <div className="grid grid-cols-1 gap-4">
        {employees.map((employee) => {
          const isExpanded = expandedIds.has(employee.id)

          return (
            <div
              key={employee.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, employee.id)}
              className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div 
                className="flex items-center justify-between p-6 cursor-pointer select-none"
                onClick={() => toggleExpanded(employee.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-bold text-lg">{employee.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-600">{employee.taskCount} tasks assigned</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-indigo-500 font-semibold bg-indigo-50 px-3 py-1 rounded-full whitespace-nowrap hidden sm:block">
                    Drop task here
                  </span>
                  <div className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-100 bg-gray-50 bg-opacity-50">
                  <div className="space-y-3 mt-4">
                    {employee.tasks && employee.tasks.length > 0 ? (
                      employee.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white border border-indigo-100 rounded-xl p-4 shadow-sm hover:shadow transition-all duration-200"
                        >
                          <h5 className="font-bold text-gray-900 text-sm mb-1">{task.title}</h5>
                          {task.description && (
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              task.status === "pending"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                            }`}>
                              {task.status}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">
                              {new Date(task.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center">
                        <p className="text-gray-400 text-sm font-medium">No tasks assigned yet</p>
                        <p className="text-gray-300 text-xs mt-1">Drag and drop a task here to assign it</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
