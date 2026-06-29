import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Clock, CheckCircle, Circle, X } from 'lucide-react';
import * as api from './api';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const requestRef = React.useRef(0);
  const projectRequestRef = React.useRef(0);
  
  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sort, setSort] = useState('dueDate,asc');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', projectId: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [statusFilter, priorityFilter, sort, page]);

  const fetchTasks = async (isRetry = false, attempt = 1) => {
    if (!isRetry) requestRef.current += 1;
    const reqId = requestRef.current;

    setLoading(true);
    try {
      const data = await api.getTasks(statusFilter, priorityFilter, page, sort);
      if (requestRef.current !== reqId) return;
      
      setTasks(data.tasks);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (err) {
      if (requestRef.current !== reqId) return;
      
      console.error(`Failed to fetch tasks (Attempt ${attempt})`, err);
      if (attempt < 12) {
        setTimeout(() => fetchTasks(true, attempt + 1), 5000);
      } else {
        setLoading(false);
      }
    }
  };

  const fetchProjects = async (isRetry = false, attempt = 1) => {
    if (!isRetry) projectRequestRef.current += 1;
    const reqId = projectRequestRef.current;

    try {
      const data = await api.getProjects();
      if (projectRequestRef.current !== reqId) return;
      
      setProjects(data);
    } catch (err) {
      if (projectRequestRef.current !== reqId) return;
      
      console.error(`Failed to fetch projects (Attempt ${attempt})`, err);
      if (attempt < 12) {
        setTimeout(() => fetchProjects(true, attempt + 1), 5000);
      }
    }
  };

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate || '',
        projectId: task.projectId || ''
      });
    } else {
      setEditingTask(null);
      setFormData({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', projectId: '' });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Prepare data
    const payload = { ...formData };
    if (!payload.projectId) payload.projectId = null;
    if (!payload.dueDate) payload.dueDate = null;

    try {
      if (editingTask) {
        await api.updateTask(editingTask.id, payload);
      } else {
        await api.createTask(payload);
      }
      handleCloseModal();
      fetchTasks();
    } catch (err) {
      if (err.response && err.response.status === 422) {
        setErrors(err.response.data);
      } else {
        alert("An error occurred");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.deleteTask(id);
        fetchTasks();
      } catch (err) {
        alert("Failed to delete task");
      }
    }
  };

  const toggleStatus = async (task) => {
    const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    try {
      await api.updateTask(task.id, { ...task, status: nextStatus, projectId: task.project ? task.project.id : null });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>TaskTracker</h1>
        <button className="btn btn-primary glass-panel" onClick={() => handleOpenModal()}>
          <Plus size={20} /> New Task
        </button>
      </header>

      <div className="controls-bar glass-panel animate-fade-in">
        <select value={statusFilter} onChange={e => {setStatusFilter(e.target.value); setPage(0);}}>
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="DOING">Doing</option>
          <option value="DONE">Done</option>
        </select>

        <select value={priorityFilter} onChange={e => {setPriorityFilter(e.target.value); setPage(0);}}>
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="dueDate,asc">Due Date (Asc)</option>
          <option value="dueDate,desc">Due Date (Desc)</option>
          <option value="createdAt,desc">Newest First</option>
        </select>
      </div>

      <div className="task-grid">
        {tasks.map((task, index) => (
          <div key={task.id} className="task-card glass-panel animate-fade-in" data-priority={task.priority} style={{animationDelay: `${index * 0.05}s`}}>
            <div className="task-header">
              <div>
                <h3 className="task-title" style={{textDecoration: task.status === 'DONE' ? 'line-through' : 'none', color: task.status === 'DONE' ? 'var(--text-muted)' : 'inherit'}}>
                  {task.title}
                </h3>
                {task.project && <span className="badge" style={{background: 'rgba(255,255,255,0.1)'}}>{task.project.name}</span>}
              </div>
              <span className={`badge badge-status-${task.status}`}>{task.status}</span>
            </div>
            
            <p className="task-desc">{task.description}</p>
            
            <div className="task-footer">
              <div className="due-date">
                <Calendar size={14} />
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
              </div>
              <div className="actions">
                <button className="icon-btn" onClick={() => toggleStatus(task)} title="Toggle Status">
                  {task.status === 'DONE' ? <CheckCircle size={18} color="var(--success)" /> : <Circle size={18} />}
                </button>
                <button className="icon-btn" onClick={() => handleOpenModal(task)}><Edit2 size={18} /></button>
                <button className="icon-btn delete" onClick={() => handleDelete(task.id)}><Trash2 size={18} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)'}}>
          <p>Loading...</p>
        </div>
      ) : tasks.length === 0 && (
        <div style={{textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)'}}>
          <p>No tasks found.</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn glass-panel" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span>Page {page + 1} of {totalPages}</span>
          <button className="btn glass-panel" disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content glass-panel animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTask ? 'Edit Task' : 'New Task'}</h2>
              <button className="icon-btn" onClick={handleCloseModal}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="Task title"
                />
                {errors.title && <span className="error-msg">{errors.title}</span>}
              </div>

              <div className="form-group" style={{marginTop: '1rem'}}>
                <label>Description</label>
                <textarea 
                  rows={3} 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Details..."
                />
              </div>

              <div className="form-row" style={{marginTop: '1rem'}}>
                <div className="form-group">
                  <label>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="TODO">To Do</option>
                    <option value="DOING">Doing</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="form-row" style={{marginTop: '1rem'}}>
                <div className="form-group">
                  <label>Due Date</label>
                  <input 
                    type="date" 
                    value={formData.dueDate} 
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Project</label>
                  <select value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}>
                    <option value="">No Project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn glass-panel" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingTask ? 'Update' : 'Create'} Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
