import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiCheckCircle, 
  FiClock, 
  FiFilter,
  FiRefreshCw
} from 'react-icons/fi';
import taskService from '../services/taskService';
import TaskForm from './TaskForm';

const Tasks = ({ user }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0
  });

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await taskService.getAllTasks();
      setTasks(data);
      
      // Calculate stats
      const newStats = {
        total: data.length,
        pending: data.filter(task => task.status === 'pending').length,
        completed: data.filter(task => task.status === 'completed').length
      };
      setStats(newStats);
      
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.error || 'Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (taskData) => {
    try {
      await taskService.createTask(taskData);
      await fetchTasks();
      setShowForm(false);
    } catch (err) {
      console.error('Error creating task:', err);
      alert(err.error || 'Failed to create task. Please try again.');
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      await taskService.updateTask(taskId, taskData);
      await fetchTasks();
      setEditingTask(null);
    } catch (err) {
      console.error('Error updating task:', err);
      alert(err.error || 'Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskService.deleteTask(taskId);
      await fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      alert(err.error || 'Failed to delete task. Please try again.');
    }
  };

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    
    // Show loading state for this specific task
    setUpdatingTaskId(task.id);
    
    try {
      // Use the smart updateTaskStatus method
      await taskService.updateTaskStatus(task.id, newStatus);
      await fetchTasks();
    } catch (err) {
      console.error('Error updating task status:', err);
      
      // Try alternative approach if the smart method fails
      try {
        // Direct update with all known fields
        await taskService.updateTask(task.id, {
          title: task.title,
          description: task.description || '',
          status: newStatus,
          id: task.id,
          user_id: task.user_id,
          created_at: task.created_at,
          updated_at: new Date().toISOString()
        });
        await fetchTasks();
      } catch (secondError) {
        alert(secondError.error || 'Failed to update task status. Please try again.');
      }
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending': return task.status === 'pending';
      case 'completed': return task.status === 'completed';
      case 'all': 
      default: return true;
    }
  });

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        icon: <FiClock />,
        color: '#f59e0b',
        text: 'Pending',
        bgColor: '#fef3c7'
      },
      completed: {
        icon: <FiCheckCircle />,
        color: '#10b981',
        text: 'Completed',
        bgColor: '#d1fae5'
      }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div className="tasks-container">
      {/* Header */}
      <div className="tasks-header">
        <div>
          <h1>My Tasks</h1>
          <p className="subtitle">Manage your tasks efficiently</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={fetchTasks}
            className="btn btn-secondary"
            disabled={loading}
            aria-label="Refresh tasks"
          >
            <FiRefreshCw className={loading ? 'spin' : ''} />
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
            aria-label="Add new task"
          >
            <FiPlus /> Add Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#f59e0b' }}>{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#10b981' }}>{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="task-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <FiFilter /> All
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          <FiClock /> Pending
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          <FiCheckCircle /> Completed
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert error">
          <strong>Error:</strong> {error}
          <button onClick={fetchTasks} className="btn-link">Try Again</button>
        </div>
      )}

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No tasks found</h3>
          <p>
            {filter === 'all' 
              ? "Get started by creating your first task!"
              : `No ${filter} tasks found.`}
          </p>
          {filter !== 'all' && (
            <button 
              onClick={() => setFilter('all')}
              className="btn btn-outline"
            >
              View All Tasks
            </button>
          )}
          <button 
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            <FiPlus /> Create Task
          </button>
        </div>
      ) : (
        <div className="task-list">
          {filteredTasks.map(task => {
            const statusConfig = getStatusConfig(task.status);
            const isUpdating = updatingTaskId === task.id;
            
            return (
              <div 
                key={task.id} 
                className={`task-card ${task.status === 'completed' ? 'completed' : ''}`}
              >
                <div className="task-content">
                  <div className="task-header">
                    <h3 className="task-title">{task.title}</h3>
                    <span 
                      className="status-badge"
                      style={{
                        color: statusConfig.color,
                        backgroundColor: statusConfig.bgColor
                      }}
                    >
                      {statusConfig.icon}
                      {statusConfig.text}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                  
                  <div className="task-meta">
                    <span className="meta-item">
                      Created: {formatDate(task.created_at)}
                    </span>
                    {task.updated_at && task.updated_at !== task.created_at && (
                      <span className="meta-item">
                        Updated: {formatDate(task.updated_at)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="task-actions">
                  <button 
                    onClick={() => handleToggleStatus(task)}
                    disabled={isUpdating}
                    className={`btn btn-icon ${task.status === 'pending' ? 'btn-success' : 'btn-warning'}`}
                    title={task.status === 'pending' ? 'Mark as completed' : 'Mark as pending'}
                  >
                    {isUpdating ? (
                      <div className="mini-spinner"></div>
                    ) : task.status === 'pending' ? (
                      <FiCheckCircle />
                    ) : (
                      <FiClock />
                    )}
                  </button>
                  
                  <button 
                    onClick={() => setEditingTask(task)}
                    className="btn btn-icon btn-secondary"
                    title="Edit task"
                  >
                    <FiEdit2 />
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    className="btn btn-icon btn-danger"
                    title="Delete task"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowForm(false)}
          mode="create"
        />
      )}

      {editingTask && (
        <TaskForm
          task={editingTask}
          onSubmit={(data) => handleUpdateTask(editingTask.id, data)}
          onCancel={() => setEditingTask(null)}
          mode="edit"
        />
      )}
    </div>
  );
};

export default Tasks;