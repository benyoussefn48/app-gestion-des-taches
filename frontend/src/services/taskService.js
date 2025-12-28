import api from '../api';

const taskService = {
  // Get all tasks
  getAllTasks: async () => {
    try {
      const response = await api.get('/tasks');
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error.response?.data || { error: error.message };
    }
  },

  // Get single task
  getTask: async (id) => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      throw error.response?.data || { error: error.message };
    }
  },

  // Create task
  createTask: async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error.response?.data || { error: error.message };
    }
  },

  // Update task (full update)
  updateTask: async (id, taskData) => {
    try {
      const response = await api.put(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
      throw error.response?.data || { error: error.message };
    }
  },

  // Delete task
  deleteTask: async (id) => {
    try {
      const response = await api.delete(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      throw error.response?.data || { error: error.message };
    }
  },

  // Update task status ONLY - Smart version that handles both cases
  updateTaskStatus: async (id, status) => {
    try {
      // First try dedicated status endpoint if it exists
      const response = await api.put(`/tasks/${id}/status`, { status });
      return response.data;
    } catch (statusError) {
      console.log('Status endpoint failed, trying full update...');
      
      try {
        // Fallback: Get current task and update all fields
        const currentTask = await taskService.getTask(id);
        
        // Ensure we have all required fields
        const updatedTask = {
          ...currentTask,
          status: status,
          updated_at: new Date().toISOString()
        };
        
        // Remove any undefined fields
        Object.keys(updatedTask).forEach(key => {
          if (updatedTask[key] === undefined) {
            delete updatedTask[key];
          }
        });
        
        const response = await api.put(`/tasks/${id}`, updatedTask);
        return response.data;
      } catch (fullUpdateError) {
        console.error('Both update methods failed:', fullUpdateError);
        throw fullUpdateError.response?.data || { error: 'Failed to update task status' };
      }
    }
  }
};

export default taskService;