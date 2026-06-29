import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

export const getTasks = async (status, priority, page = 0, sort = 'dueDate,asc') => {
  const params = { page, sort };
  if (status) params.status = status;
  if (priority) params.priority = priority;
  const res = await api.get('/tasks', { params });
  return res.data;
};

export const createTask = async (taskData) => {
  const res = await api.post('/tasks', taskData);
  return res.data;
};

export const updateTask = async (id, taskData) => {
  const res = await api.put(`/tasks/${id}`, taskData);
  return res.data;
};

export const deleteTask = async (id) => {
  const res = await api.delete(`/tasks/${id}`);
  return res.data;
};

export const getProjects = async () => {
  const res = await api.get('/projects');
  return res.data;
};

export default api;
