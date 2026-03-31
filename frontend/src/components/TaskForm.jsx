import { useState, useEffect } from "react"
import { createTask, updateTask, getEmployees } from "../api/client"
import toast from "react-hot-toast"

export default function TaskForm({ onTaskCreated, editingTask, onEditComplete }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title)
      setDescription(editingTask.description)
      setAssignedTo(editingTask.assigned_to)
    }
  }, [editingTask])

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees()
      setEmployees(data.employees || [])
    } catch (err) {
      console.error("Error fetching employees for form:", err)
      // fallback just in case
      setEmployees([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    if (!title.trim()) {
      toast.error("Please enter a task title")
      setLoading(false)
      return
    }

    if (!assignedTo) {
      toast.error("Please select an employee to assign this task")
      setLoading(false)
      return
    }

    try {
      if (editingTask) {
        await updateTask(editingTask.id, title, description, assignedTo, editingTask.status)
        toast.success("Task updated successfully!")
        onEditComplete()
      } else {
        await createTask(title, description, assignedTo)
        toast.success("New task created!")
      }
      
      // Only clear if not unmounting
      if (!editingTask) {
        setTitle("")
        setDescription("")
        setAssignedTo("")
      }
      onTaskCreated()
    } catch (err) {
      console.error("Error:", err)
      toast.error(err.message || "Failed to save task")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-800 rounded-3xl shadow-xl border border-slate-700 p-8 sm:p-10 transition-all duration-300">
      <h3 className="text-3xl font-black text-white mb-8 tracking-tight">
        {editingTask ? "Edit Task" : "Create New Task"}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design the new landing page"
              required
              className="w-full px-5 py-4 bg-slate-900 border border-slate-700 rounded-xl focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-lg font-medium text-slate-200"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">
              Assign To
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              required
              className="w-full px-5 py-4 bg-slate-900 border border-slate-700 rounded-xl focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-lg font-medium text-slate-200 appearance-none"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any extra details or context..."
            rows="4"
            className="w-full px-5 py-4 bg-slate-900 border border-slate-700 rounded-xl focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-lg font-medium text-slate-200 resize-y"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-1 sm:flex-none"
          >
            {loading ? "Saving..." : editingTask ? "Update Task" : "Create Task"}
          </button>
          {editingTask && (
            <button
              type="button"
              onClick={onEditComplete}
              className="px-8 py-4 bg-slate-700 border-2 border-slate-600 hover:bg-slate-600 hover:border-slate-500 text-slate-200 font-bold text-lg rounded-xl transition-all duration-200 flex-1 sm:flex-none"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}


