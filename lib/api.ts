import { IItem, IBooking, IReview, IUser } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// Generic request handler
async function apiRequest<T>( endpoint: string, options: RequestInit = {} ): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error at ${endpoint}:`, error);
    throw error;
  }
}

// Auth API
export const authAPI = {
    login: (email: string, password: string) =>
        apiRequest<{ user: IUser; token: string}>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (userData: { name: string; email: string; password: string; role: 'renter' | 'owner'}) =>
        apiRequest<{ user: IUser; token:string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({userData}),
        }),

    logout: () => apiRequest('/auth/logout', { method: 'POST' }),

    getCurrentUser: () => apiRequest<IUser>('/auth/me'),
};

// Items API
export const itemsAPI = {
  // Get all items with optional filters
  getItems: (params?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    return apiRequest<IItem[]>(`/items?${queryParams}`);
  },

  // Get single item
  getItem: (id: string) => apiRequest<IItem>(`/items/${id}`),

  // Create new item (owner only)
  createItem: (itemData: FormData | Omit<IItem, '_id' | 'owner' | 'createdAt' | 'updatedAt'>) =>
    apiRequest<IItem>('/items', {
      method: 'POST',
      body: itemData instanceof FormData ? itemData : JSON.stringify(itemData),
      headers: itemData instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    }),

  // Update item (owner only)
  updateItem: (id: string, itemData: Partial<IItem>) =>
    apiRequest<IItem>(`/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(itemData),
    }),

  // Delete item (owner only)
  deleteItem: (id: string) =>
    apiRequest<{ message: string }>(`/items/${id}`, {
      method: 'DELETE',
    }),

  // Get user's items
  getMyItems: () => apiRequest<IItem[]>('/items/my-items'),
};

// Bookings API
export const bookingsAPI = {
  // Get all bookings (with filters for user type)
  getBookings: (params?: { status?: string; type?: 'owner' | 'renter' }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }
    return apiRequest<IBooking[]>(`/bookings?${queryParams}`);
  },

  // Get single booking
  getBooking: (id: string) => apiRequest<IBooking>(`/bookings/${id}`),

  // Create booking (renter only)
  createBooking: (bookingData: {
    item: string;
    startDate: string;
    endDate: string;
  }) => apiRequest<IBooking>('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  }),

  // Update booking status (owner or renter)
  updateBooking: (id: string, updateData: {
    status?: 'confirmed' | 'cancelled';
    cancellationReason?: string;
    cancelledBy?: string;
  }) => apiRequest<IBooking>(`/bookings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData),
  }),

  // Delete booking (only pending bookings)
  deleteBooking: (id: string) =>
    apiRequest<{ message: string }>(`/bookings/${id}`, {
      method: 'DELETE',
    }),

  // Get bookings for specific item
  getItemBookings: (itemId: string) =>
    apiRequest<IBooking[]>(`/bookings/item/${itemId}`),
};

// Reviews API
export const reviewsAPI = {
  // Get reviews with filters
  getReviews: (params?: { item?: string; user?: string; type?: 'received' | 'given' }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }
    return apiRequest<IReview[]>(`/reviews?${queryParams}`);
  },

  // Get single review
  getReview: (id: string) => apiRequest<IReview>(`/reviews/${id}`),

  // Create review
  createReview: (reviewData: {
    reviewer: string;
    item?: string;
    reviewee?: string;
    rating: number;
    comment?: string;
  }) => apiRequest<{ message: string; review: IReview }>('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData),
  }),

  // Update review (comment only)
  updateReview: (id: string, updateData: { comment: string }) =>
    apiRequest<IReview>(`/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    }),

  // Delete review
  deleteReview: (id: string) =>
    apiRequest<{ message: string }>(`/reviews/${id}`, {
      method: 'DELETE',
    }),
};

// Users API
export const usersAPI = {
  // Get user profile
  getUser: (id: string) => apiRequest<IUser>(`/users/${id}`),

  // Update user profile
  updateUser: (id: string, userData: Partial<IUser>) =>
    apiRequest<IUser>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    }),

  // Upload user avatar
  uploadAvatar: (id: string, imageFile: File) => {
    const formData = new FormData();
    formData.append('avatar', imageFile);
    return apiRequest<IUser>(`/users/${id}/avatar`, {
      method: 'POST',
      body: formData,
    });
  },
};

// Search API
export const searchAPI = {
  // Global search across items
  searchItems: (query: string, filters?: { category?: string; location?: string }) => {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    return apiRequest<IItem[]>(`/search?${params}`);
  },
};

// Export all APIs
export const api = {
  auth: authAPI,
  items: itemsAPI,
  bookings: bookingsAPI,
  reviews: reviewsAPI,
  users: usersAPI,
  search: searchAPI,
};

export default api;