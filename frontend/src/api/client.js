const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://smartbotics-taskflow-8.onrender.com";

let authToken = localStorage.getItem("authToken");

export const setAuthToken = (token) => {
  authToken = token;
  localStorage.setItem("authToken", token);
};

export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem("authToken");
  localStorage.removeItem("userProfile");
};

export const setUserProfile = (user) => {
  localStorage.setItem("userProfile", JSON.stringify(user));
};

export const getUserProfile = () => {
  const profile = localStorage.getItem("userProfile");
  return profile ? JSON.parse(profile) : null;
};

const getHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Auth APIs
export const signupUser = async (email, password, name, role) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, password, name, role }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Signup failed");
  }

  return response.json();
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Login failed");
  }

  const data = await response.json();
  if (data.session?.access_token) {
    setAuthToken(data.session.access_token);
  }
  if (data.user) {
    setUserProfile(data.user);
  }
  return data;
};

export const getEmployees = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/employees`, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch employees");
  }

  return response.json();
};

export const getCurrentUser = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
};

// Task APIs
export const createTask = async (title, description, assignedTo, priority, notes) => {
  const response = await fetch(`${API_BASE_URL}/tasks/create`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      title,
      description,
      assigned_to: assignedTo || null,
      priority: priority || "P3",
      notes: notes || "",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create task");
  }

  return response.json();
};

export const getAllTasks = async () => {
  const response = await fetch(`${API_BASE_URL}/tasks/all`, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return response.json();
};

export const getMyTasks = async () => {
  const response = await fetch(`${API_BASE_URL}/tasks/my`, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch my tasks");
  }

  return response.json();
};

export const completeTask = async (taskId) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/complete`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ status: "completed" }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to complete task");
  }

  return response.json();
};

export const updateTask = async (taskId, title, description, assignedTo, status, priority, notes) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({
      title,
      description,
      assigned_to: assignedTo || null,
      status,
      priority,
      notes,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update task");
  }

  return response.json();
};

export const deleteTask = async (taskId) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to delete task");
  }

  return response.json();
};

export const getTaskHistory = async () => {
  const response = await fetch(`${API_BASE_URL}/tasks/history`, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch history");
  }

  return response.json();
};
