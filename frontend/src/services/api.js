import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('recruitai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor
axiosInstance.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.error('API Error:', err.response?.data || err.message);
    return Promise.reject(err.response?.data || { message: err.message });
  }
);

// ─── Auth API ─────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => axiosInstance.post('/auth/login', { email, password }),
  register: (data) => axiosInstance.post('/auth/register', data),
  me: () => axiosInstance.get('/auth/me'),
  forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => axiosInstance.post('/auth/reset-password', { token, password }),
};

// ─── Jobs API ─────────────────────────────────────────────
export const jobsAPI = {
  getAll: (params = {}) => axiosInstance.get('/jobs', { params }),
  getById: (id) => axiosInstance.get(`/jobs/${id}`),
  create: (data) => axiosInstance.post('/jobs', data),
  update: (id, data) => axiosInstance.put(`/jobs/${id}`, data),
  delete: (id) => axiosInstance.delete(`/jobs/${id}`),
  getApplications: (jobId) => axiosInstance.get(`/jobs/${jobId}/applications`),
};

// ─── Applications API ─────────────────────────────────────
export const applicationsAPI = {
  apply: (data) => axiosInstance.post('/applications', data),
  getByJob: (jobId) => axiosInstance.get(`/applications/job/${jobId}`),
  getByCandidate: () => axiosInstance.get('/applications/candidate'),
  updateStage: (id, stage) => axiosInstance.patch(`/applications/${id}/stage`, { stage }),
  getById: (id) => axiosInstance.get(`/applications/${id}`),
};

// ─── Resume API ───────────────────────────────────────────
export const resumeAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return axiosInstance.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  parse: (id) => axiosInstance.post(`/resumes/${id}/parse`),
  getParsed: (id) => axiosInstance.get(`/resumes/${id}/parsed`),
  getAll: () => axiosInstance.get('/resumes'),
};

// ─── Matching API ─────────────────────────────────────────
export const matchingAPI = {
  match: (resumeId, jobId) => axiosInstance.post('/matching/match', { resumeId, jobId }),
  getRankings: (jobId) => axiosInstance.get(`/matching/rankings/${jobId}`),
  getRecommendedJobs: (candidateId) => axiosInstance.get(`/matching/recommended/${candidateId}`),
};

// ─── Interviews API ───────────────────────────────────────
export const interviewsAPI = {
  schedule: (data) => axiosInstance.post('/interviews', data),
  getAll: (params = {}) => axiosInstance.get('/interviews', { params }),
  getById: (id) => axiosInstance.get(`/interviews/${id}`),
  update: (id, data) => axiosInstance.put(`/interviews/${id}`, data),
  cancel: (id) => axiosInstance.delete(`/interviews/${id}`),
};

// ─── Analytics API ────────────────────────────────────────
export const analyticsAPI = {
  getDashboard: () => axiosInstance.get('/analytics/dashboard'),
  getFunnel: () => axiosInstance.get('/analytics/funnel'),
  getTrends: (params = {}) => axiosInstance.get('/analytics/trends', { params }),
  getByDepartment: () => axiosInstance.get('/analytics/departments'),
};

// ─── Notifications API ────────────────────────────────────
export const notificationsAPI = {
  getAll: () => axiosInstance.get('/notifications'),
  markRead: (id) => axiosInstance.patch(`/notifications/${id}/read`),
  markAllRead: () => axiosInstance.patch('/notifications/read-all'),
  delete: (id) => axiosInstance.delete(`/notifications/${id}`),
};

// ─── Candidates API ───────────────────────────────────────
export const candidatesAPI = {
  getAll: (params = {}) => axiosInstance.get('/candidates', { params }),
  getById: (id) => axiosInstance.get(`/candidates/${id}`),
  update: (id, data) => axiosInstance.put(`/candidates/${id}`, data),
  addNote: (id, note) => axiosInstance.post(`/candidates/${id}/notes`, { note }),
  getNotes: (id) => axiosInstance.get(`/candidates/${id}/notes`),
};

// ─── Admin API ────────────────────────────────────────────
export const adminAPI = {
  getUsers: (params = {}) => axiosInstance.get('/admin/users', { params }),
  updateUser: (id, data) => axiosInstance.put(`/admin/users/${id}`, data),
  deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`),
  getStats: () => axiosInstance.get('/admin/stats'),
  getLogs: () => axiosInstance.get('/admin/logs'),
};

export default axiosInstance;
