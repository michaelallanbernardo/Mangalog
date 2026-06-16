export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

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
    // For backward compatibility, fetch all manga without pagination
    const response = await fetch(`${API_URL}/manga?limit=1000`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch manga");
    const result = await response.json();
    // Return just the data array for backward compatibility
    return result.data || result;
  },

  getFiltered: async (filters, token) => {
    const params = new URLSearchParams();
    if (filters.status && filters.status.length > 0) {
      params.append("status", filters.status.join(","));
    }
    if (filters.minRating !== undefined) {
      params.append("minRating", filters.minRating);
    }
    if (filters.maxRating !== undefined) {
      params.append("maxRating", filters.maxRating);
    }
    if (filters.sortBy) {
      params.append("sortBy", filters.sortBy);
    }
    if (filters.sortOrder) {
      params.append("sortOrder", filters.sortOrder);
    }
    if (filters.page) {
      params.append("page", filters.page);
    }
    if (filters.limit) {
      params.append("limit", filters.limit);
    }
    if (filters.search) {
      params.append("search", filters.search);
    }

    const response = await fetch(`${API_URL}/manga?${params.toString()}`, {
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
