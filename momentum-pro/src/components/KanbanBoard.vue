<template>
  <div class="kanban-container">
    <div class="kanban-controls">
      <div class="filter-controls">
        <label for="kanban-filter">Filter:</label>
        <select id="kanban-filter" v-model="taskFilter" @change="savePreferences">
          <option value="all">All Tasks</option>
          <option value="importance">By Importance</option>
        </select>
      </div>
    </div>
    
    <div class="kanban-board">
      <!-- To Do Column -->
      <div class="kanban-column todo-column">
        <div class="column-header">
          <h3>To Do</h3>
          <span class="task-count">{{ todoTasks.length }}</span>
        </div>
        <div 
          class="column-content"
          @dragover.prevent
          @drop="onDrop($event, 'todo')"
        >
          <div 
            v-for="task in todoTasks" 
            :key="task.id"
            class="kanban-task"
            :class="[
              `importance-${task.importance || 'medium'}`,
              { 'is-dragging': draggedTask?.id === task.id }
            ]"
            draggable="true"
            @dragstart="onDragStart($event, task)"
            @dragend="onDragEnd"
            @click="openTaskDetails(task)"
          >
            <div class="task-header">
              <h4>{{ task.title }}</h4>
              <div class="task-actions">
                <button @click.stop="startEditTask(task)" class="edit-btn" title="Edit task">
                  <span class="icon">✏️</span>
                </button>
              </div>
            </div>
            <p class="task-description" v-if="task.description">
              {{ truncateDescription(task.description) }}
            </p>
            <div class="task-footer">
              <span class="importance-badge" :class="`importance-${task.importance || 'medium'}`">
                {{ task.importance ? task.importance.charAt(0).toUpperCase() + task.importance.slice(1) : 'Medium' }}
              </span>
              <span class="task-date">{{ formatDate(task.created_at) }}</span>
            </div>
          </div>
          <div v-if="todoTasks.length === 0" class="empty-column">
            No tasks to do
          </div>
        </div>
      </div>
      
      <!-- In Progress Column -->
      <div class="kanban-column progress-column">
        <div class="column-header">
          <h3>In Progress</h3>
          <span class="task-count">{{ inProgressTasks.length }}</span>
        </div>
        <div 
          class="column-content"
          @dragover.prevent
          @drop="onDrop($event, 'in-progress')"
        >
          <div 
            v-for="task in inProgressTasks" 
            :key="task.id"
            class="kanban-task"
            :class="[
              `importance-${task.importance || 'medium'}`,
              { 'is-dragging': draggedTask?.id === task.id }
            ]"
            draggable="true"
            @dragstart="onDragStart($event, task)"
            @dragend="onDragEnd"
            @click="openTaskDetails(task)"
          >
            <div class="task-header">
              <h4>{{ task.title }}</h4>
              <div class="task-actions">
                <button @click.stop="startEditTask(task)" class="edit-btn" title="Edit task">
                  <span class="icon">✏️</span>
                </button>
              </div>
            </div>
            <p class="task-description" v-if="task.description">
              {{ truncateDescription(task.description) }}
            </p>
            <div class="task-footer">
              <span class="importance-badge" :class="`importance-${task.importance || 'medium'}`">
                {{ task.importance ? task.importance.charAt(0).toUpperCase() + task.importance.slice(1) : 'Medium' }}
              </span>
              <span class="task-date">{{ formatDate(task.created_at) }}</span>
            </div>
          </div>
          <div v-if="inProgressTasks.length === 0" class="empty-column">
            No tasks in progress
          </div>
        </div>
      </div>
      
      <!-- Done Column -->
      <div class="kanban-column done-column">
        <div class="column-header">
          <h3>Done</h3>
          <span class="task-count">{{ doneTasks.length }}</span>
        </div>
        <div 
          class="column-content"
          @dragover.prevent
          @drop="onDrop($event, 'done')"
        >
          <div 
            v-for="task in doneTasks" 
            :key="task.id"
            class="kanban-task completed-task"
            :class="[
              `importance-${task.importance || 'medium'}`,
              { 'is-dragging': draggedTask?.id === task.id }
            ]"
            draggable="true"
            @dragstart="onDragStart($event, task)"
            @dragend="onDragEnd"
            @click="openTaskDetails(task)"
          >
            <div class="task-header">
              <h4>{{ task.title }}</h4>
              <div class="task-actions">
                <button @click.stop="startEditTask(task)" class="edit-btn" title="Edit task">
                  <span class="icon">✏️</span>
                </button>
              </div>
            </div>
            <p class="task-description" v-if="task.description">
              {{ truncateDescription(task.description) }}
            </p>
            <div class="task-footer">
              <span class="importance-badge" :class="`importance-${task.importance || 'medium'}`">
                {{ task.importance ? task.importance.charAt(0).toUpperCase() + task.importance.slice(1) : 'Medium' }}
              </span>
              <span class="task-date">{{ formatDate(task.created_at) }}</span>
            </div>
            <div class="completion-indicator">
              <span class="completion-icon">✓</span>
            </div>
          </div>
          <div v-if="doneTasks.length === 0" class="empty-column">
            No completed tasks
          </div>
        </div>
      </div>
    </div>
    
    <!-- Task Details Modal -->
    <div v-if="selectedTask" class="modal-overlay" @click.self="closeTaskDetails">
      <div class="modal-content task-details-modal">
        <div class="modal-header">
          <h3>Task Details</h3>
          <button @click="closeTaskDetails" class="close-btn">×</button>
        </div>
        
        <div class="task-details">
          <div class="detail-group">
            <h4>{{ selectedTask.title }}</h4>
            <span class="importance-badge" :class="`importance-${selectedTask.importance || 'medium'}`">
              {{ selectedTask.importance ? selectedTask.importance.charAt(0).toUpperCase() + selectedTask.importance.slice(1) : 'Medium' }}
            </span>
          </div>
          
          <div class="detail-group">
            <label>Description:</label>
            <p>{{ selectedTask.description || 'No description provided' }}</p>
          </div>
          
          <div class="detail-group">
            <label>Status:</label>
            <select v-model="selectedTaskStatus" @change="updateTaskStatus">
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          
          <div class="detail-group">
            <label>Created:</label>
            <p>{{ formatDate(selectedTask.created_at, true) }}</p>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="startEditTask(selectedTask)" class="edit-btn">
            Edit Task
          </button>
          <button @click="confirmDeleteTask(selectedTask.id)" class="delete-btn">
            Delete Task
          </button>
        </div>
      </div>
    </div>
    
    <!-- Edit Task Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="cancelEdit">
      <div class="modal-content edit-task-modal">
        <div class="modal-header">
          <h3>Edit Task</h3>
          <button @click="cancelEdit" class="close-btn">×</button>
        </div>
        
        <div class="edit-form">
          <div class="form-group">
            <label for="edit-title">Title</label>
            <div class="input-wrapper">
              <input 
                type="text" 
                id="edit-title" 
                v-model="editTaskForm.title" 
                placeholder="Task title"
                maxlength="50"
              />
              <div class="char-counter" :class="{ 'near-limit': editTaskForm.title.length > 40 }">
                {{ editTaskForm.title.length }}/50
              </div>
              <span class="input-focus-effect"></span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="edit-description">Description</label>
            <div class="input-wrapper">
              <textarea 
                id="edit-description" 
                v-model="editTaskForm.description" 
                placeholder="Task description"
                maxlength="200"
                rows="4"
              ></textarea>
              <div class="char-counter" :class="{ 'near-limit': editTaskForm.description.length > 160 }">
                {{ editTaskForm.description.length }}/200
              </div>
              <span class="input-focus-effect"></span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="edit-importance">Importance</label>
            <select id="edit-importance" v-model="editTaskForm.importance">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="edit-status">Status</label>
            <select id="edit-status" v-model="editTaskForm.status">
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="saveTaskEdit" class="save-btn" :disabled="!editTaskForm.title.trim()">
            Save Changes
          </button>
          <button @click="cancelEdit" class="cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal-content">
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete this task? This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="deleteTask(taskToDelete)" class="confirm-btn">Yes, Delete</button>
          <button @click="cancelDelete" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';
import { useTaskStore } from '../store/task';
import { usePreferencesStore } from '../store/preferences';

const props = defineProps({
  tasks: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['edit-task', 'delete-task']);

const taskStore = useTaskStore();
const preferencesStore = usePreferencesStore();

// Local state
const taskFilter = ref('all');
const draggedTask = ref(null);
const selectedTask = ref(null);
const selectedTaskStatus = ref('todo');
const showEditModal = ref(false);
const showDeleteConfirm = ref(false);
const taskToDelete = ref(null);

// Edit task form
const editTaskForm = ref({
  title: '',
  description: '',
  importance: 'medium',
  status: 'todo'
});

// Computed properties for filtered tasks
const todoTasks = computed(() => {
  if (!props.tasks) return [];
  
  let filtered = props.tasks.filter(task => 
    !task.is_complete && (!task.status || task.status === 'todo')
  );
  
  if (taskFilter.value === 'importance') {
    return sortByImportance(filtered);
  }
  
  return filtered;
});

const inProgressTasks = computed(() => {
  if (!props.tasks) return [];
  
  let filtered = props.tasks.filter(task => 
    !task.is_complete && task.status === 'in-progress'
  );
  
  if (taskFilter.value === 'importance') {
    return sortByImportance(filtered);
  }
  
  return filtered;
});

const doneTasks = computed(() => {
  if (!props.tasks) return [];
  
  let filtered = props.tasks.filter(task => 
    task.is_complete || task.status === 'done'
  );
  
  if (taskFilter.value === 'importance') {
    return sortByImportance(filtered);
  }
  
  return filtered;
});

// Helper function to sort by importance
const sortByImportance = (tasks) => {
  const importanceOrder = { high: 3, medium: 2, low: 1 };
  return [...tasks].sort((a, b) => {
    const aImportance = importanceOrder[a.importance || 'medium'] || 2;
    const bImportance = importanceOrder[b.importance || 'medium'] || 2;
    return bImportance - aImportance;
  });
};

// Save preferences
const savePreferences = () => {
  preferencesStore.setKanbanFilter(taskFilter.value);
};

// Drag and drop handlers
const onDragStart = (event, task) => {
  draggedTask.value = task;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', task.id);
  
  // Add a delay to add the dragging class for visual feedback
  setTimeout(() => {
    event.target.classList.add('is-dragging');
  }, 0);
};

const onDragEnd = () => {
  draggedTask.value = null;
};

const onDrop = async (event, status) => {
  event.preventDefault();
  
  if (!draggedTask.value) return;
  
  const taskId = draggedTask.value.id;
  const updates = { status };
  
  // If dropping in done column, also mark as complete
  if (status === 'done') {
    updates.is_complete = true;
  } else {
    updates.is_complete = false;
  }
  
  try {
    await taskStore.updateTask(taskId, updates);
  } catch (error) {
    console.error('Error updating task status:', error);
  }
};

// Task details handlers
const openTaskDetails = (task) => {
  selectedTask.value = task;
  selectedTaskStatus.value = task.status || (task.is_complete ? 'done' : 'todo');
};

const closeTaskDetails = () => {
  selectedTask.value = null;
};

const updateTaskStatus = async () => {
  if (!selectedTask.value) return;
  
  const updates = { 
    status: selectedTaskStatus.value,
    is_complete: selectedTaskStatus.value === 'done'
  };
  
  try {
    await taskStore.updateTask(selectedTask.value.id, updates);
    // Update the selected task with the new status
    selectedTask.value = {
      ...selectedTask.value,
      ...updates
    };
  } catch (error) {
    console.error('Error updating task status:', error);
  }
};

// Edit task handlers
const startEditTask = (task) => {
  editTaskForm.value = {
    title: task.title,
    description: task.description || '',
    importance: task.importance || 'medium',
    status: task.status || (task.is_complete ? 'done' : 'todo')
  };
  
  showEditModal.value = true;
  
  // If task details modal is open, close it
  if (selectedTask.value) {
    selectedTask.value = null;
  }
};

const saveTaskEdit = async () => {
  if (!editTaskForm.value.title.trim()) return;
  
  const updates = {
    title: editTaskForm.value.title.trim(),
    description: editTaskForm.value.description.trim(),
    importance: editTaskForm.value.importance,
    status: editTaskForm.value.status,
    is_complete: editTaskForm.value.status === 'done'
  };
  
  try {
    emit('edit-task', { id: selectedTask.value.id, updates });
    showEditModal.value = false;
  } catch (error) {
    console.error('Error saving task edits:', error);
  }
};

const cancelEdit = () => {
  showEditModal.value = false;
};

// Delete task handlers
const confirmDeleteTask = (taskId) => {
  taskToDelete.value = taskId;
  showDeleteConfirm.value = true;
  
  // If task details modal is open, close it
  if (selectedTask.value) {
    selectedTask.value = null;
  }
};

const deleteTask = async (taskId) => {
  try {
    emit('delete-task', taskId);
    showDeleteConfirm.value = false;
    taskToDelete.value = null;
  } catch (error) {
    console.error('Error deleting task:', error);
  }
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  taskToDelete.value = null;
};

// Helper functions
const truncateDescription = (description, maxLength = 60) => {
  if (!description) return '';
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength) + '...';
};

const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  
  if (includeTime) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};
</script>

<style scoped>
.kanban-container {
  width: 100%;
  padding: 1rem 0;
}

.kanban-controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-controls select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  height: calc(100vh - 250px);
  min-height: 500px;
}

.kanban-column {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-tertiary);
  border-radius: 8px;
  overflow: hidden;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}

.column-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.task-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-card);
  color: var(--color-text-secondary);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 0.8rem;
}

.column-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  height: 100%;
}

/* Custom scrollbar for column content */
.column-content::-webkit-scrollbar {
  width: 6px;
}

.column-content::-webkit-scrollbar-track {
  background: var(--color-bg-tertiary);
}

.column-content::-webkit-scrollbar-thumb {
  background-color: var(--color-bg-card);
  border-radius: 3px;
}

.empty-column {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: var(--color-text-muted);
  font-style: italic;
  border: 2px dashed var(--color-border);
  border-radius: 6px;
  margin-top: 0.5rem;
}

/* Column-specific styling */
.todo-column .column-header {
  border-top: 3px solid var(--color-accent-primary);
}

.progress-column .column-header {
  border-top: 3px solid var(--color-gold);
}

.done-column .column-header {
  border-top: 3px solid var(--color-green);
}

/* Task cards */
.kanban-task {
  background-color: var(--color-bg-card);
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-sm);
  cursor: grab;
  position: relative;
  transition: all 0.2s ease;
}

.kanban-task:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.kanban-task.is-dragging {
  opacity: 0.5;
  transform: scale(0.95);
  box-shadow: var(--shadow-lg);
}

.kanban-task.completed-task h4 {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.task-header h4 {
  margin: 0;
  font-size: 1rem;
  word-break: break-word;
  flex: 1;
}

.task-actions {
  display: flex;
  gap: 0.25rem;
}

.task-actions button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  font-size: 0.8rem;
}

.task-actions button:hover {
  background-color: var(--color-bg-tertiary);
}

.task-description {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  word-break: break-word;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.8rem;
}

.task-date {
  color: var(--color-text-muted);
}

/* Importance styling */
.importance-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.importance-high {
  border-left: 3px solid var(--color-red);
}

.importance-high .importance-badge {
  background-color: rgba(255, 56, 96, 0.1);
  color: var(--color-red);
}

.importance-medium {
  border-left: 3px solid var(--color-gold);
}

.importance-medium .importance-badge {
  background-color: rgba(255, 215, 0, 0.1);
  color: var(--color-gold-dark);
}

.importance-low {
  border-left: 3px solid var(--color-green);
}

.importance-low .importance-badge {
  background-color: rgba(35, 209, 96, 0.1);
  color: var(--color-green);
}

/* Completion indicator */
.completion-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--color-green);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  box-shadow: var(--shadow-sm);
}

/* Modal styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--color-bg-secondary);
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--color-text-primary);
}

.task-details {
  padding: 1rem;
}

.detail-group {
  margin-bottom: 1rem;
}

.detail-group h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.detail-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: var(--color-text-secondary);
}

.detail-group p {
  margin: 0;
  line-height: 1.5;
}

.detail-group select {
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid var(--color-border);
}

.modal-actions button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn {
  background-color: var(--color-accent-primary);
  color: white;
  border: none;
}

.edit-btn:hover {
  background-color: var(--color-purple-dark);
}

.delete-btn {
  background-color: var(--color-red);
  color: white;
  border: none;
}

.delete-btn:hover {
  background-color: var(--color-red-dark);
}

.confirm-btn {
  background-color: var(--color-red);
  color: white;
  border: none;
}

.confirm-btn:hover {
  background-color: var(--color-red-dark);
}

.cancel-btn {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.cancel-btn:hover {
  background-color: var(--color-bg-card);
}

.save-btn {
  background-color: var(--color-accent-primary);
  color: white;
  border: none;
}

.save-btn:hover:not(:disabled) {
  background-color: var(--color-purple-dark);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Edit form styling */
.edit-form {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input,
.input-wrapper textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input-wrapper input:focus,
.input-wrapper textarea:focus {
  border-color: var(--color-accent-primary);
  outline: none;
}

.input-wrapper textarea {
  resize: vertical;
  min-height: 100px;
}

.char-counter {
  position: absolute;
  right: 8px;
  bottom: 8px;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.char-counter.near-limit {
  color: var(--color-red);
}

.input-focus-effect {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--color-accent-primary);
  transition: width 0.3s;
}

.input-wrapper input:focus ~ .input-focus-effect,
.input-wrapper textarea:focus ~ .input-focus-effect {
  width: 100%;
}

/* Responsive styles */
@media (max-width: 768px) {
  .kanban-board {
    grid-template-columns: 1fr;
    height: auto;
    min-height: auto;
  }
  
  .kanban-column {
    margin-bottom: 1rem;
    height: auto;
    max-height: 400px;
  }
  
  .column-content {
    max-height: 350px;
  }
}
</style>