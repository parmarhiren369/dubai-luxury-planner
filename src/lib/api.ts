// For Vercel: use /api, for local development: use http://localhost:5001/api
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5001/api');

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new ApiError(response.status, error.message || 'Request failed');
  }

  return response.json();
}

// Hotels API
export const hotelsApi = {
  getAll: (params?: { search?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    return fetchApi(`/hotels?${query.toString()}`);
  },
  getById: (id: string) => fetchApi(`/hotels/${id}`),
  create: (data: any) => fetchApi('/hotels', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi(`/hotels/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/hotels/${id}`, { method: 'DELETE' }),
  getRateForDate: (hotelId: string, roomType: string, mealPlan: string, date: string) => {
    return fetchApi(`/hotels/${hotelId}/rate?roomType=${roomType}&mealPlan=${mealPlan}&date=${date}`);
  },
  setRateForDate: (hotelId: string, data: any) => {
    return fetchApi(`/hotels/${hotelId}/rate`, { method: 'POST', body: JSON.stringify(data) });
  },
  getRatesForPeriod: (hotelId: string, startDate: string, endDate: string, mealPlan: string) => {
    const query = new URLSearchParams();
    query.append('startDate', startDate);
    query.append('endDate', endDate);
    query.append('mealPlan', mealPlan);
    return fetchApi(`/hotels/${hotelId}/rates/period?${query.toString()}`);
  },
  bulkSetRates: (hotelId: string, data: { rates: Array<{ date: string; roomType: string; rate: number }>; mealPlan: string }) => {
    return fetchApi(`/hotels/${hotelId}/rates/bulk`, { method: 'POST', body: JSON.stringify(data) });
  },
  copyRateToAll: (hotelId: string, data: { sourceDate: string; roomType: string; mealPlan: string; startDate: string; endDate: string }) => {
    return fetchApi(`/hotels/${hotelId}/rates/copy`, { method: 'POST', body: JSON.stringify(data) });
  },
  import: (data: any[]) => fetchApi('/hotels/import', { method: 'POST', body: JSON.stringify(data) }),
};

// Customers API
export const customersApi = {
  getAll: (params?: { search?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    return fetchApi(`/customers?${query.toString()}`);
  },
  getById: (id: string) => fetchApi(`/customers/${id}`),
  create: (data: any) => fetchApi('/customers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/customers/${id}`, { method: 'DELETE' }),
};

// Agents API
export const agentsApi = {
  getAll: (params?: { search?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    return fetchApi(`/agents?${query.toString()}`);
  },
  getById: (id: string) => fetchApi(`/agents/${id}`),
  create: (data: any) => fetchApi('/agents', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi(`/agents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/agents/${id}`, { method: 'DELETE' }),
};

// Quotations API
export const quotationsApi = {
  getAll: (params?: { search?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    return fetchApi(`/quotations?${query.toString()}`);
  },
  getById: (id: string) => fetchApi(`/quotations/${id}`),
  create: (data: any) => fetchApi('/quotations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi(`/quotations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) => {
    return fetchApi(`/quotations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },
  delete: (id: string) => fetchApi(`/quotations/${id}`, { method: 'DELETE' }),
};

// Sightseeing API
export const sightseeingApi = {
  getAll: (params?: { search?: string; category?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    return fetchApi(`/sightseeing?${query.toString()}`);
  },
  getById: (id: string) => fetchApi(`/sightseeing/${id}`),
  create: (data: any) => fetchApi('/sightseeing', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi(`/sightseeing/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/sightseeing/${id}`, { method: 'DELETE' }),
  import: (data: any[]) => fetchApi('/sightseeing/import', { method: 'POST', body: JSON.stringify(data) }),
};

// Meals API
export const mealsApi = {
  getAll: (params?: { search?: string; type?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.type) query.append('type', params.type);
    if (params?.status) query.append('status', params.status);
    return fetchApi(`/meals?${query.toString()}`);
  },
  getById: (id: string) => fetchApi(`/meals/${id}`),
  create: (data: any) => fetchApi('/meals', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi(`/meals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/meals/${id}`, { method: 'DELETE' }),
};

// Transfers API
export const transfersApi = {
  getAll: (params?: { search?: string; type?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.type) query.append('type', params.type);
    if (params?.status) query.append('status', params.status);
    return fetchApi(`/transfers?${query.toString()}`);
  },
  getById: (id: string) => fetchApi(`/transfers/${id}`),
  create: (data: any) => fetchApi('/transfers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi(`/transfers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/transfers/${id}`, { method: 'DELETE' }),
};

// Entry Tickets API
export const entryTicketsApi = {
  getAll: (params?: { search?: string; category?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    return fetchApi(`/entry-tickets?${query.toString()}`);
  },
  getById: (id: string) => fetchApi(`/entry-tickets/${id}`),
  create: (data: any) => fetchApi('/entry-tickets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi(`/entry-tickets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/entry-tickets/${id}`, { method: 'DELETE' }),
};

// Visa API
export const visaApi = {
  getAll: (params?: { search?: string; country?: string; type?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.country) query.append('country', params.country);
    if (params?.type) query.append('type', params.type);
    if (params?.status) query.append('status', params.status);
    return fetchApi(`/visa?${query.toString()}`);
  },
  getById: (id: string) => fetchApi(`/visa/${id}`),
  create: (data: any) => fetchApi('/visa', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi(`/visa/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/visa/${id}`, { method: 'DELETE' }),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => fetchApi('/dashboard/stats'),
  getRecentQuotations: () => fetchApi('/dashboard/recent-quotations'),
  getUpcomingBookings: () => fetchApi('/dashboard/upcoming-bookings'),
};

export { ApiError };
