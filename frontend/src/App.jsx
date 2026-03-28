import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ManagerDashboard from "./pages/ManagerDashboard"
import EmployeeDashboard from "./pages/EmployeeDashboard"
import { Toaster } from "react-hot-toast"

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: "font-semibold text-gray-900 rounded-xl shadow-lg border border-gray-100",
          success: {
            iconTheme: { primary: "#4f46e5", secondary: "#fff" }
          }
        }} 
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/employee" element={<EmployeeDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App