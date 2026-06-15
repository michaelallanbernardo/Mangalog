const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Auth API calls
export const authAPI = {
  register: async (username, email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }
    return response.json();
  },

  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }
    return response.json();
  },

  getMe: async (token) => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }
    return response.json();
  },
};

// Manga API calls
export const mangaAPI = {
  getAll: async (token) => {
    const response = await fetch(`${API_URL}/manga`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch manga");
    return response.json();
  },

  getById: async (id, token) => {
    const response = await fetch(`${API_URL}/manga/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch manga");
    return response.json();
  },

  create: async (mangaData, token) => {
    const response = await fetch(`${API_URL}/manga`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mangaData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create manga");
    }
    return response.json();
  },

  update: async (id, mangaData, token) => {
    const response = await fetch(`${API_URL}/manga/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mangaData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update manga");
    }
    return response.json();
  },

  delete: async (id, token) => {
    const response = await fetch(`${API_URL}/manga/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to delete manga");
    return response.json();
  },
};
