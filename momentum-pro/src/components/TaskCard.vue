<template>
  <div 
    class="task-card"
    :class="[
      { 'completed-task': task.is_complete },
      `importance-${task.importance || 'medium'}`
    ]"
  >
    <!-- Edit mode -->
    <div v-if="isEditing" class="edit-mode">
      <div class="input-wrapper">
        <input 
          type="text" 
          v-model="editForm.title" 
          class="edit-input"
          placeholder="Task title"
          maxlength="50"
        />
        <div class="char-counter" :class="{ 'near-limit': editForm.title.length > 40 }">
          {{ editForm.title.length }}/50
        </div>
        <span class="input-focus-effect"></span>
      </div>
      
      <div class="input-wrapper">
        <textarea 
          v-model="editForm.description" 
          class="edit-textarea"
          placeholder="Task description"
          maxlength="200"
        ></textarea>
        <div class="char-counter" :class="{ 'near-limit': editForm.description.length > 160 }">
          {{ editForm.description.length }}/200
        </div>
        <span class="input-focus-effect"></span>
      </div>
      
      <div class="form-row">
        <label>
          <span class="label-icon">⚡</span>
          Importance:
        </label>
        <select v-model="editForm.importance" class="importance-select">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      
      <div class="edit-actions">
        <button @click="saveEdit" class="save-btn" :disabled="!editForm.title.trim()">
          <span class="btn-text">Save</span>
        </button>
        <button @click="cancelEdit" class="cancel-btn">
          <span class="btn-text">Cancel</span>
        </button>
      </div>
    </div>
    
    <!-- View mode -->
    <div v-else>
      <div class="task-header">
        <div class="task-title-area">
          <h4 :class="{ 'completed': task.is_complete }">{{ task.title }}</h4>
          <span class="importance-badge" :class="`importance-${task.importance || 'medium'}`">
            {{ task.importance ? task.importance.charAt(0).toUpperCase() + task.importance.slice(1) : 'Medium' }}
          </span>
        </div>
        <div class="task-actions">
          <button @click="startEdit" class="edit-btn" title="Edit task">
            <span class="icon">✏️</span>
          </button>
          <button @click="toggleStatus" class="status-btn" :title="task.is_complete ? 'Mark as incomplete' : 'Mark as complete'">
            <span class="icon">{{ task.is_complete ? '↩️' : '✓' }}</span>
          </button>
          <button @click="confirmDelete" class="delete-btn" title="Delete task">
            <span class="icon">🗑️</span>
          </button>
        </div>
      </div>
      <div class="task-content">
        <div class="description-container">
          <p class="task-description" :class="{ 'expanded': isExpanded }">
            {{ task.description || 'No description' }}
          </p>
          <button 
            v-if="task.description && task.description.length > 100" 
            @click="toggleExpand" 
            class="read-more-btn"
          >
            {{ isExpanded ? 'Show Less' : 'Read More' }}
          </button>
        </div>
        <div class="task-meta">
          <span>Created: {{ formatDate(task.created_at) }}</span>
        </div>
      </div>
      
      <!-- Task completion indicator -->
      <div v-if="task.is_complete" class="completion-indicator">
        <span class="completion-icon">✓</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
});

const emit = defineEmits([
  'update-task',
  'toggle-status',
  'delete-task'
]);

// Local state
const isEditing = ref(false);
const isExpanded = ref(false);
const editForm = ref({
  title: '',
  description: '',
  importance: 'medium'
});

// Methods
const startEdit = () => {
  editForm.value = {
    title: props.task.title,
    description: props.task.description || '',
    importance: props.task.importance || 'medium'
  };
  isEditing.value = true;
};

const saveEdit = () => {
  if (!editForm.value.title.trim()) return;
  
  emit('update-task', {
    id: props.task.id,
    updates: {
      title: editForm.value.title.trim(),
      description: editForm.value.description.trim(),
      importance: editForm.value.importance
    }
  });
  
  isEditing.value = false;
};

const cancelEdit = () => {
  isEditing.value = false;
};

const toggleStatus = () => {
  emit('toggle-status', props.task);
};

const confirmDelete = () => {
  emit('delete-task', props.task.id);
};

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
</script>

<style scoped>
/* Inherit styles from parent component */
.task-card {
  position: relative;
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-medium);
}

.task-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* Task header */
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.task-title-area {
  flex: 1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.task-title-area h4 {
  margin: 0;
  font-size: 1.1rem;
  word-break: break-word;
}

.task-title-area h4.completed {
  text-decoration: line-through;
  color: var(--text-muted);
}

/* Task actions */
.task-actions {
  display: flex;
  gap: 8px;
}

.task-actions button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color var(--transition-fast);
}

.task-actions button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Task content */
.task-content {
  margin-top: 8px;
}

.description-container {
  margin-bottom: 12px;
}

.task-description {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  transition: all var(--transition-medium);
}

.task-description.expanded {
  -webkit-line-clamp: unset;
  max-height: none;
}

.read-more-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  padding: 0;
  margin-top: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.task-meta {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Edit mode */
.edit-mode {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-wrapper {
  position: relative;
}

.edit-input,
.edit-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
  background-color: var(--input-bg);
  color: var(--text-primary);
  transition: border-color var(--transition-medium);
}

.edit-textarea {
  min-height: 80px;
  resize: vertical;
}

.edit-input:focus,
.edit-textarea:focus {
  border-color: var(--primary-color);
  outline: none;
}

.char-counter {
  position: absolute;
  right: 8px;
  bottom: 8px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.char-counter.near-limit {
  color: var(--warning-color);
}

.edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.save-btn,
.cancel-btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color var(--transition-medium);
}

.save-btn {
  background-color: var(--primary-color);
  color: white;
}

.save-btn:hover:not(:disabled) {
  background-color: var(--primary-dark);
}

.save-btn:disabled {
  background-color: var(--disabled-color);
  cursor: not-allowed;
}

.cancel-btn {
  background-color: var(--secondary-bg);
  color: var(--text-primary);
}

.cancel-btn:hover {
  background-color: var(--border-color);
}

/* Importance styles */
.importance-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.importance-high {
  background-color: var(--high-color-bg);
  color: var(--high-color-text);
}

.importance-medium {
  background-color: var(--medium-color-bg);
  color: var(--medium-color-text);
}

.importance-low {
  background-color: var(--low-color-bg);
  color: var(--low-color-text);
}

/* Completion indicator */
.completion-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--success-color);
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
</style>