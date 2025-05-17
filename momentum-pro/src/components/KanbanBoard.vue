<template>
  <div class="kanban-container">
    <h2 class="kanban-title">Kanban Board</h2>
    
    <div class="swimlane-controls">
      <div class="swimlane-selector">
        <label for="swimlane-type">Swimlanes:</label>
        <select id="swimlane-type" v-model="swimlaneType" @change="updateSwimlanes">
          <option value="none">No Swimlanes</option>
          <option value="importance">By Importance</option>
          <option value="date">By Date</option>
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
        
        <!-- No Swimlanes -->
        <div v-if="swimlaneType === 'none'" class="swimlane">
          <draggable 
            class="task-list"
            :list="todoTasks"
            group="tasks"
            item-key="id"
            @change="(event) => onDragChange('todo', event)"
            :animation="200"
          >
            <template #item="{ element }">
              <div class="kanban-task" :class="`importance-${element.importance || 'medium'}`">
                <div class="task-header">
                  <h4>{{ element.title }}</h4>
                  <span class="importance-badge" :class="`importance-${element.importance || 'medium'}`">
                    {{ element.importance ? element.importance.charAt(0).toUpperCase() + element.importance.slice(1) : 'Medium' }}
                  </span>
                </div>
                <p class="task-description">{{ truncateDescription(element.description) }}</p>
                <div class="task-actions">
                  <button @click="editTask(element)" class="edit-btn" title="Edit task">
                    <span class="icon">✏️</span>
                  </button>
                  <button @click="deleteTask(element.id)" class="delete-btn" title="Delete task">
                    <span class="icon">🗑️</span>
                  </button>
                </div>
              </div>
            </template>
          </draggable>
        </div>
        
        <!-- Importance Swimlanes -->
        <div v-if="swimlaneType === 'importance'" class="swimlanes">
          <div v-for="importance in importanceLevels" :key="importance.value" class="swimlane">
            <div class="swimlane-header" :class="`importance-${importance.value}`">
              <h4>{{ importance.label }}</h4>
              <span class="task-count">{{ getTasksByImportance(todoTasks, importance.value).length }}</span>
            </div>
            <draggable 
              class="task-list"
              :list="getTasksByImportance(todoTasks, importance.value)"
              group="tasks"
              item-key="id"
              @change="onDragChange('todo')"
              :animation="200"
            >
              <template #item="{ element }">
                <div class="kanban-task" :class="`importance-${element.importance || 'medium'}`">
                  <div class="task-header">
                    <h4>{{ element.title }}</h4>
                  </div>
                  <p class="task-description">{{ truncateDescription(element.description) }}</p>
                  <div class="task-actions">
                    <button @click="editTask(element)" class="edit-btn" title="Edit task">
                      <span class="icon">✏️</span>
                    </button>
                    <button @click="deleteTask(element.id)" class="delete-btn" title="Delete task">
                      <span class="icon">🗑️</span>
                    </button>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
        
        <!-- Date Swimlanes -->
        <div v-if="swimlaneType === 'date'" class="swimlanes">
          <div v-for="dateRange in dateRanges" :key="dateRange.value" class="swimlane">
            <div class="swimlane-header date-swimlane">
              <h4>{{ dateRange.label }}</h4>
              <span class="task-count">{{ getTasksByDateRange(todoTasks, dateRange.value).length }}</span>
            </div>
            <draggable 
              class="task-list"
              :list="getTasksByDateRange(todoTasks, dateRange.value)"
              group="tasks"
              item-key="id"
              @change="onDragChange('todo')"
              :animation="200"
            >
              <template #item="{ element }">
                <div class="kanban-task" :class="`importance-${element.importance || 'medium'}`">
                  <div class="task-header">
                    <h4>{{ element.title }}</h4>
                    <span class="importance-badge" :class="`importance-${element.importance || 'medium'}`">
                      {{ element.importance ? element.importance.charAt(0).toUpperCase() + element.importance.slice(1) : 'Medium' }}
                    </span>
                  </div>
                  <p class="task-description">{{ truncateDescription(element.description) }}</p>
                  <div class="task-actions">
                    <button @click="editTask(element)" class="edit-btn" title="Edit task">
                      <span class="icon">✏️</span>
                    </button>
                    <button @click="deleteTask(element.id)" class="delete-btn" title="Delete task">
                      <span class="icon">🗑️</span>
                    </button>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>

      <!-- In Progress Column -->
      <div class="kanban-column in-progress-column">
        <div class="column-header">
          <h3>In Progress</h3>
          <span class="task-count">{{ inProgressTasks.length }}</span>
        </div>
        
        <!-- No Swimlanes -->
        <div v-if="swimlaneType === 'none'" class="swimlane">
          <draggable 
            class="task-list"
            :list="inProgressTasks"
            group="tasks"
            item-key="id"
            @change="onDragChange('in-progress')"
            :animation="200"
          >
            <template #item="{ element }">
              <div class="kanban-task" :class="`importance-${element.importance || 'medium'}`">
                <div class="task-header">
                  <h4>{{ element.title }}</h4>
                  <span class="importance-badge" :class="`importance-${element.importance || 'medium'}`">
                    {{ element.importance ? element.importance.charAt(0).toUpperCase() + element.importance.slice(1) : 'Medium' }}
                  </span>
                </div>
                <p class="task-description">{{ truncateDescription(element.description) }}</p>
                <div class="task-actions">
                  <button @click="editTask(element)" class="edit-btn" title="Edit task">
                    <span class="icon">✏️</span>
                  </button>
                  <button @click="deleteTask(element.id)" class="delete-btn" title="Delete task">
                    <span class="icon">🗑️</span>
                  </button>
                </div>
              </div>
            </template>
          </draggable>
        </div>
        
        <!-- Importance Swimlanes -->
        <div v-if="swimlaneType === 'importance'" class="swimlanes">
          <div v-for="importance in importanceLevels" :key="importance.value" class="swimlane">
            <div class="swimlane-header" :class="`importance-${importance.value}`">
              <h4>{{ importance.label }}</h4>
              <span class="task-count">{{ getTasksByImportance(inProgressTasks, importance.value).length }}</span>
            </div>
            <draggable 
              class="task-list"
              :list="getTasksByImportance(inProgressTasks, importance.value)"
              group="tasks"
              item-key="id"
              @change="onDragChange('in-progress')"
              :animation="200"
            >
              <template #item="{ element }">
                <div class="kanban-task" :class="`importance-${element.importance || 'medium'}`">
                  <div class="task-header">
                    <h4>{{ element.title }}</h4>
                  </div>
                  <p class="task-description">{{ truncateDescription(element.description) }}</p>
                  <div class="task-actions">
                    <button @click="editTask(element)" class="edit-btn" title="Edit task">
                      <span class="icon">✏️</span>
                    </button>
                    <button @click="deleteTask(element.id)" class="delete-btn" title="Delete task">
                      <span class="icon">🗑️</span>
                    </button>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
        
        <!-- Date Swimlanes -->
        <div v-if="swimlaneType === 'date'" class="swimlanes">
          <div v-for="dateRange in dateRanges" :key="dateRange.value" class="swimlane">
            <div class="swimlane-header date-swimlane">
              <h4>{{ dateRange.label }}</h4>
              <span class="task-count">{{ getTasksByDateRange(inProgressTasks, dateRange.value).length }}</span>
            </div>
            <draggable 
              class="task-list"
              :list="getTasksByDateRange(inProgressTasks, dateRange.value)"
              group="tasks"
              item-key="id"
              @change="onDragChange('in-progress')"
              :animation="200"
            >
              <template #item="{ element }">
                <div class="kanban-task" :class="`importance-${element.importance || 'medium'}`">
                  <div class="task-header">
                    <h4>{{ element.title }}</h4>
                    <span class="importance-badge" :class="`importance-${element.importance || 'medium'}`">
                      {{ element.importance ? element.importance.charAt(0).toUpperCase() + element.importance.slice(1) : 'Medium' }}
                    </span>
                  </div>
                  <p class="task-description">{{ truncateDescription(element.description) }}</p>
                  <div class="task-actions">
                    <button @click="editTask(element)" class="edit-btn" title="Edit task">
                      <span class="icon">✏️</span>
                    </button>
                    <button @click="deleteTask(element.id)" class="delete-btn" title="Delete task">
                      <span class="icon">🗑️</span>
                    </button>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>

      <!-- Done Column -->
      <div class="kanban-column done-column">
        <div class="column-header">
          <h3>Done</h3>
          <span class="task-count">{{ doneTasks.length }}</span>
        </div>
        
        <!-- No Swimlanes -->
        <div v-if="swimlaneType === 'none'" class="swimlane">
          <draggable 
            class="task-list"
            :list="doneTasks"
            group="tasks"
            item-key="id"
            @change="onDragChange('done')"
            :animation="200"
          >
            <template #item="{ element }">
              <div class="kanban-task" :class="`importance-${element.importance || 'medium'}`">
                <div class="task-header">
                  <h4>{{ element.title }}</h4>
                  <span class="importance-badge" :class="`importance-${element.importance || 'medium'}`">
                    {{ element.importance ? element.importance.charAt(0).toUpperCase() + element.importance.slice(1) : 'Medium' }}
                  </span>
                </div>
                <p class="task-description">{{ truncateDescription(element.description) }}</p>
                <div class="task-actions">
                  <button @click="editTask(element)" class="edit-btn" title="Edit task">
                    <span class="icon">✏️</span>
                  </button>
                  <button @click="deleteTask(element.id)" class="delete-btn" title="Delete task">
                    <span class="icon">🗑️</span>
                  </button>
                </div>
              </div>
            </template>
          </draggable>
        </div>
        
        <!-- Importance Swimlanes -->
        <div v-if="swimlaneType === 'importance'" class="swimlanes">
          <div v-for="importance in importanceLevels" :key="importance.value" class="swimlane">
            <div class="swimlane-header" :class="`importance-${importance.value}`">
              <h4>{{ importance.label }}</h4>
              <span class="task-count">{{ getTasksByImportance(doneTasks, importance.value).length }}</span>
            </div>
            <draggable 
              class="task-list"
              :list="getTasksByImportance(doneTasks, importance.value)"
              group="tasks"
              item-key="id"
              @change="onDragChange('done')"
              :animation="200"
            >
              <template #item="{ element }">
                <div class="kanban-task" :class="`importance-${element.importance || 'medium'}`">
                  <div class="task-header">
                    <h4>{{ element.title }}</h4>
                  </div>
                  <p class="task-description">{{ truncateDescription(element.description) }}</p>
                  <div class="task-actions">
                    <button @click="editTask(element)" class="edit-btn" title="Edit task">
                      <span class="icon">✏️</span>
                    </button>
                    <button @click="deleteTask(element.id)" class="delete-btn" title="Delete task">
                      <span class="icon">🗑️</span>
                    </button>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
        
        <!-- Date Swimlanes -->
        <div v-if="swimlaneType === 'date'" class="swimlanes">
          <div v-for="dateRange in dateRanges" :key="dateRange.value" class="swimlane">
            <div class="swimlane-header date-swimlane">
              <h4>{{ dateRange.label }}</h4>
              <span class="task-count">{{ getTasksByDateRange(doneTasks, dateRange.value).length }}</span>
            </div>
            <draggable 
              class="task-list"
              :list="getTasksByDateRange(doneTasks, dateRange.value)"
              group="tasks"
              item-key="id"
              @change="onDragChange('done')"
              :animation="200"
            >
              <template #item="{ element }">
                <div class="kanban-task" :class="`importance-${element.importance || 'medium'}`">
                  <div class="task-header">
                    <h4>{{ element.title }}</h4>
                    <span class="importance-badge" :class="`importance-${element.importance || 'medium'}`">
                      {{ element.importance ? element.importance.charAt(0).toUpperCase() + element.importance.slice(1) : 'Medium' }}
                    </span>
                  </div>
                  <p class="task-description">{{ truncateDescription(element.description) }}</p>
                  <div class="task-actions">
                    <button @click="editTask(element)" class="edit-btn" title="Edit task">
                      <span class="icon">✏️</span>
                    </button>
                    <button @click="deleteTask(element.id)" class="delete-btn" title="Delete task">
                      <span class="icon">🗑️</span>
                    </button>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Edit Task</h3>
        <div class="form-group">
          <div class="input-wrapper">
            <input 
              type="text" 
              v-model="editTaskForm.title" 
              placeholder="Task title" 
              class="task-input"
              maxlength="50"
            />
            <div class="char-counter" :class="{ 'near-limit': editTaskForm.title.length > 40 }">
              {{ editTaskForm.title.length }}/50
            </div>
          </div>
          
          <div class="input-wrapper">
            <textarea 
              v-model="editTaskForm.description" 
              placeholder="Task description (optional)" 
              class="task-textarea"
              maxlength="200"
            ></textarea>
            <div class="char-counter" :class="{ 'near-limit': editTaskForm.description.length > 160 }">
              {{ editTaskForm.description.length }}/200
            </div>
          </div>
          
          <div class="form-row">
            <label>
              <span class="label-icon">⚡</span>
              Importance:
            </label>
            <select v-model="editTaskForm.importance" class="importance-select">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div class="form-row">
            <label>
              <span class="label-icon">📋</span>
              Status:
            </label>
            <select v-model="editTaskForm.status" class="status-select">
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          
          <div class="modal-actions">
            <button @click="saveTaskEdit" class="save-btn" :disabled="!editTaskForm.title.trim()">
              Save
            </button>
            <button @click="cancelEdit" class="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal-content">
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete this task? This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="confirmDelete" class="confirm-btn">Yes, Delete</button>
          <button @click="cancelDelete" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useTaskStore } from '../store/task';
import { usePreferencesStore } from '../store/preferences';
import draggable from 'vuedraggable';

const taskStore = useTaskStore();
const preferencesStore = usePreferencesStore();
const { tasks } = storeToRefs(taskStore);

// Task lists for each column
const todoTasks = ref([]);
const inProgressTasks = ref([]);
const doneTasks = ref([]);

// Swimlane configuration
const swimlaneType = ref(localStorage.getItem('kanban_swimlane') || 'none');

// Importance levels for swimlanes
const importanceLevels = [
  { value: 'high', label: 'High Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'low', label: 'Low Priority' }
];

// Date ranges for swimlanes
const dateRanges = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this-week', label: 'This Week' },
  { value: 'last-week', label: 'Last Week' },
  { value: 'older', label: 'Older' }
];

// Edit task state
const showEditModal = ref(false);
const editTaskForm = ref({
  id: null,
  title: '',
  description: '',
  importance: 'medium',
  status: 'todo'
});

// Delete confirmation state
const showDeleteConfirm = ref(false);
const taskToDeleteId = ref(null);

// Sort tasks into columns based on status
const sortTasksIntoColumns = () => {
  if (!tasks.value) return;
  
  todoTasks.value = tasks.value.filter(task => 
    task.status === 'todo' || (!task.status && !task.is_complete)
  );
  
  inProgressTasks.value = tasks.value.filter(task => 
    task.status === 'in-progress'
  );
  
  doneTasks.value = tasks.value.filter(task => 
    task.status === 'done' || (!task.status && task.is_complete)
  );
};

// Watch for changes in tasks and update columns
watch(tasks, () => {
  sortTasksIntoColumns();
}, { immediate: true, deep: true });

// Handle drag and drop changes
const onDragChange = async (column, event) => {
  // If there's no change event, return
  if (!event) return;
  
  // Handle added items
  if (event.added) {
    const task = event.added.element;
    let newStatus = column;
    let isComplete = column === 'done';
    
    await taskStore.updateTask(task.id, { 
      status: newStatus,
      is_complete: isComplete 
    });
  }
  
  // Handle moved items (reordering within the same column)
  if (event.moved) {
    // We could implement order persistence here if needed
    console.log('Task reordered within column:', column);
  }
  
  // Handle removed items (they were moved to another column, so we don't need to update them here)
  if (event.removed) {
    console.log('Task removed from column:', column);
  }
};

// Truncate description for display
const truncateDescription = (description) => {
  if (!description) return 'No description';
  return description.length > 60 
    ? description.substring(0, 60) + '...' 
    : description;
};

// Update swimlanes
const updateSwimlanes = () => {
  localStorage.setItem('kanban_swimlane', swimlaneType.value);
};

// Get tasks by importance
const getTasksByImportance = (taskList, importance) => {
  return taskList.filter(task => (task.importance || 'medium') === importance);
};

// Get tasks by date range
const getTasksByDateRange = (taskList, range) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());
  
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  
  return taskList.filter(task => {
    const taskDate = new Date(task.created_at);
    
    switch (range) {
      case 'today':
        return taskDate >= today;
      case 'yesterday':
        return taskDate >= yesterday && taskDate < today;
      case 'this-week':
        return taskDate >= thisWeekStart && taskDate < yesterday;
      case 'last-week':
        return taskDate >= lastWeekStart && taskDate < thisWeekStart;
      case 'older':
        return taskDate < lastWeekStart;
      default:
        return true;
    }
  });
};

// Edit task
const editTask = (task) => {
  editTaskForm.value = {
    id: task.id,
    title: task.title,
    description: task.description || '',
    importance: task.importance || 'medium',
    status: task.status || (task.is_complete ? 'done' : 'todo')
  };
  showEditModal.value = true;
};

// Save task edit
const saveTaskEdit = async () => {
  if (!editTaskForm.value.title.trim()) return;
  
  const updates = {
    title: editTaskForm.value.title.trim(),
    description: editTaskForm.value.description.trim(),
    importance: editTaskForm.value.importance,
    status: editTaskForm.value.status,
    is_complete: editTaskForm.value.status === 'done'
  };
  
  await taskStore.updateTask(editTaskForm.value.id, updates);
  showEditModal.value = false;
};

// Cancel edit
const cancelEdit = () => {
  showEditModal.value = false;
};

// Delete task
const deleteTask = (id) => {
  taskToDeleteId.value = id;
  showDeleteConfirm.value = true;
};

// Confirm delete
const confirmDelete = async () => {
  if (taskToDeleteId.value) {
    await taskStore.deleteTask(taskToDeleteId.value);
    showDeleteConfirm.value = false;
    taskToDeleteId.value = null;
  }
};

// Cancel delete
const cancelDelete = () => {
  showDeleteConfirm.value = false;
  taskToDeleteId.value = null;
};

onMounted(async () => {
  // Fetch tasks if not already loaded
  if (!tasks.value || tasks.value.length === 0) {
    await taskStore.fetchTasks();
  }
  
  sortTasksIntoColumns();
});
</script>

<style scoped>
.kanban-container {
  width: 100%;
  padding: 1rem;
}

.kanban-title {
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
  font-size: 1.8rem;
  text-align: center;
}

.swimlane-controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.swimlane-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.swimlane-selector label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.swimlane-selector select {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: 0.9rem;
}

.kanban-board {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  min-height: 70vh;
}

@media (max-width: 768px) {
  .kanban-board {
    flex-direction: column;
    min-height: auto;
  }
}

.kanban-column {
  flex: 1;
  min-width: 300px;
  background: var(--color-bg-secondary);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.column-header {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.column-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.task-count {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.todo-column .column-header {
  border-top: 4px solid #3498db;
}

.in-progress-column .column-header {
  border-top: 4px solid #f39c12;
}

.done-column .column-header {
  border-top: 4px solid #2ecc71;
}

.task-list {
  padding: 1rem;
  overflow-y: auto;
  flex-grow: 1;
  min-height: 50px;
}

.swimlanes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  flex-grow: 1;
}

.swimlane {
  background: var(--color-bg-tertiary);
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.swimlane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--color-border);
  border-radius: 6px 6px 0 0;
}

.swimlane-header h4 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.swimlane-header.importance-high {
  background-color: rgba(231, 76, 60, 0.1);
  border-left: 3px solid #e74c3c;
}

.swimlane-header.importance-medium {
  background-color: rgba(243, 156, 18, 0.1);
  border-left: 3px solid #f39c12;
}

.swimlane-header.importance-low {
  background-color: rgba(52, 152, 219, 0.1);
  border-left: 3px solid #3498db;
}

.swimlane-header.date-swimlane {
  background-color: rgba(52, 73, 94, 0.1);
  border-left: 3px solid #34495e;
}

.kanban-task {
  background: var(--color-bg-primary);
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: grab;
  position: relative;
  border-left: 4px solid transparent;
}

.kanban-task:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.kanban-task.importance-high {
  border-left-color: #e74c3c;
}

.kanban-task.importance-medium {
  border-left-color: #f39c12;
}

.kanban-task.importance-low {
  border-left-color: #3498db;
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

.importance-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  margin-left: 0.5rem;
  white-space: nowrap;
}

.importance-high {
  background-color: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.importance-medium {
  background-color: rgba(243, 156, 18, 0.2);
  color: #f39c12;
}

.importance-low {
  background-color: rgba(52, 152, 219, 0.2);
  color: #3498db;
}

.task-description {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
  word-break: break-word;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.task-actions button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.task-actions button:hover {
  background-color: var(--color-bg-tertiary);
}

.edit-btn .icon {
  font-size: 1rem;
}

.delete-btn .icon {
  font-size: 1rem;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background-color: var(--color-bg-primary);
  border-radius: 8px;
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-wrapper {
  position: relative;
}

.task-input, .task-textarea, .importance-select, .status-select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.task-input:focus, .task-textarea:focus, .importance-select:focus, .status-select:focus {
  outline: none;
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-accent-primary-rgb), 0.2);
}

.task-textarea {
  min-height: 100px;
  resize: vertical;
}

.char-counter {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  font-size: 0.7rem;
  color: var(--color-text-secondary);
}

.char-counter.near-limit {
  color: #e74c3c;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-row label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  min-width: 100px;
}

.label-icon {
  font-size: 1.2rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.save-btn, .confirm-btn {
  background-color: var(--color-accent-primary);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.save-btn:hover, .confirm-btn:hover {
  background-color: color-mix(in srgb, var(--color-accent-primary) 80%, black);
}

.save-btn:disabled {
  background-color: var(--color-light-gray);
  cursor: not-allowed;
}

.cancel-btn {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background-color: var(--color-bg-secondary);
}
</style>