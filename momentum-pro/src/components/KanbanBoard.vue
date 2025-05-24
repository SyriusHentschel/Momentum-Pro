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
          <div class="header-title">
            <button @click="toggleColumn('todo')" class="collapse-btn">
              <span class="collapse-icon" :class="{ 'collapsed': collapsedColumns.todo }">▼</span>
            </button>
            <h3>To Do</h3>
          </div>
          <span class="task-count">{{ todoTasks.length }}</span>
        </div>
        <div class="column-actions">
          <button @click="createNewTask('todo')" class="add-task-btn">
            <span class="icon">+</span> Add Task
          </button>
        </div>
        
        <div v-if="!collapsedColumns.todo" class="column-content">
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
              @change="(event) => onDragChange('todo', event)"
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
        </div>
      </div>
      </div>

      <!-- In Progress Column -->
      <div class="kanban-column in-progress-column">
        <div class="column-header">
          <div class="header-title">
            <button @click="toggleColumn('in-progress')" class="collapse-btn">
              <span class="collapse-icon" :class="{ 'collapsed': collapsedColumns['in-progress'] }">▼</span>
            </button>
            <h3>In Progress</h3>
          </div>
          <span class="task-count">{{ inProgressTasks.length }}</span>
        </div>
        <!-- No Add Task button for In Progress column -->
        
        <div v-if="!collapsedColumns['in-progress']" class="column-content">
        <!-- No Swimlanes -->
        <div v-if="swimlaneType === 'none'" class="swimlane">
          <draggable 
            class="task-list"
            :list="inProgressTasks"
            group="tasks"
            item-key="id"
            @change="(event) => onDragChange('in-progress', event)"
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
              @change="(event) => onDragChange('in-progress', event)"
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
              @change="(event) => onDragChange('in-progress', event)"
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

      <!-- Complete Column -->
      <div class="kanban-column done-column">
        <div class="column-header">
          <div class="header-title">
            <button @click="toggleColumn('done')" class="collapse-btn">
              <span class="collapse-icon" :class="{ 'collapsed': collapsedColumns.done }">▼</span>
            </button>
            <h3>Complete</h3>
          </div>
          <span class="task-count">{{ doneTasks.length }}</span>
        </div>
        <!-- No Add Task button for Complete column -->
        
        <div v-if="!collapsedColumns.done" class="column-content">
        <!-- No Swimlanes -->
        <div v-if="swimlaneType === 'none'" class="swimlane">
          <draggable 
            class="task-list"
            :list="doneTasks"
            group="tasks"
            item-key="id"
            @change="(event) => onDragChange('done', event)"
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
              @change="(event) => onDragChange('done', event)"
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
              @change="(event) => onDragChange('done', event)"
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
              <option value="done">Complete</option>
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
import { useUserStore } from '../store/user';
import { useToastStore } from '../store/toast';
import { usePreferencesStore } from '../store/preferences';
import { supabase } from '../supabase';
import draggable from 'vuedraggable';

const taskStore = useTaskStore();
const preferencesStore = usePreferencesStore();
const toastStore = useToastStore();
const { tasks } = storeToRefs(taskStore);

// Task lists for each column
const todoTasks = ref([]);
const inProgressTasks = ref([]);
const doneTasks = ref([]);

// Column collapse state
const collapsedColumns = ref({
  todo: false,
  'in-progress': false,
  done: false
});

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

// Sort tasks into columns based on status or is_complete
const sortTasksIntoColumns = () => {
  if (!tasks.value) return;
  
  // Create a local copy of tasks with computed status for each task
  const tasksWithStatus = tasks.value.map(task => {
    // Create a new object with all properties from the original task
    const taskWithStatus = { ...task };
    
    // First check if we have a saved kanban column state for this task
    const kanbanState = localStorage.getItem('kanban_column_state');
    const kanbanStateObj = kanbanState ? JSON.parse(kanbanState) : {};
    const savedColumn = kanbanStateObj[taskWithStatus.id];
    
    // If the task has a status field (dev mode), use that
    if (taskWithStatus.status) {
      taskWithStatus.computedStatus = taskWithStatus.status;
    } 
    // If the task is complete, it goes in the done column
    else if (taskWithStatus.is_complete) {
      taskWithStatus.computedStatus = 'done';
    }
    // Check for the special marker in the description
    else if (taskWithStatus.description && taskWithStatus.description.includes('[STATUS:in-progress]')) {
      taskWithStatus.computedStatus = 'in-progress';
      taskWithStatus._kanbanColumn = 'in-progress';
    }
    // If we have a saved column state and it's in-progress, use that
    else if (savedColumn === 'in-progress' || taskWithStatus._kanbanColumn === 'in-progress') {
      taskWithStatus.computedStatus = 'in-progress';
      // Make sure the _kanbanColumn property is set
      taskWithStatus._kanbanColumn = 'in-progress';
    }
    // Otherwise, it's a todo task
    else {
      taskWithStatus.computedStatus = 'todo';
    }
    
    return taskWithStatus;
  });
  
  // Log the tasks with their computed status for debugging
  console.log('Tasks with computed status:', tasksWithStatus.map(t => ({
    id: t.id,
    title: t.title,
    status: t.status,
    is_complete: t.is_complete,
    _kanbanColumn: t._kanbanColumn,
    computedStatus: t.computedStatus
  })));
  
  // Now filter tasks into columns based on computed status
  todoTasks.value = tasksWithStatus.filter(task => 
    task.computedStatus === 'todo'
  );
  
  inProgressTasks.value = tasksWithStatus.filter(task => 
    task.computedStatus === 'in-progress'
  );
  
  doneTasks.value = tasksWithStatus.filter(task => 
    task.computedStatus === 'done'
  );
  
  // Log the column counts for debugging
  console.log('Column counts:', {
    todo: todoTasks.value.length,
    inProgress: inProgressTasks.value.length,
    done: doneTasks.value.length
  });
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
    
    // Set a local property to track which column this task is in
    // This won't be sent to the database because we'll filter it out
    task._kanbanColumn = column;
    
    // Save the kanban column state to localStorage
    const kanbanState = localStorage.getItem('kanban_column_state');
    const kanbanStateObj = kanbanState ? JSON.parse(kanbanState) : {};
    kanbanStateObj[task.id] = column;
    localStorage.setItem('kanban_column_state', JSON.stringify(kanbanStateObj));
    
    // Update the task with appropriate fields
    const updateData = { 
      is_complete: isComplete,
      _kanbanColumn: column // Include this so it gets passed to the store
    };
    
    // Add a special marker in the description for in-progress tasks
    if (column === 'in-progress' && task.description && !task.description.includes('[STATUS:in-progress]')) {
      updateData.description = `[STATUS:in-progress] ${task.description || ''}`;
    } else if (column !== 'in-progress' && task.description && task.description.includes('[STATUS:in-progress]')) {
      // Remove the marker if the task is no longer in progress
      updateData.description = task.description.replace('[STATUS:in-progress] ', '');
    }
    
    // Only include status for dev mode tasks
    if (localStorage.getItem('dev_mode_user')) {
      updateData.status = newStatus;
    }
    
    await taskStore.updateTask(task.id, updateData);
    
    console.log(`Task moved to ${column} column:`, task.title);
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
  
  // Remove the status marker for display
  let displayDescription = description;
  if (displayDescription.includes('[STATUS:in-progress]')) {
    displayDescription = displayDescription.replace('[STATUS:in-progress] ', '');
  }
  
  return displayDescription.length > 60 
    ? displayDescription.substring(0, 60) + '...' 
    : displayDescription;
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
  // Determine the correct status based on the task's current column
  let currentStatus = task.status;
  
  // If no status is set, determine it from _kanbanColumn or is_complete
  if (!currentStatus) {
    if (task._kanbanColumn) {
      currentStatus = task._kanbanColumn;
    } else if (task.is_complete) {
      currentStatus = 'done';
    } else {
      // Check the kanban state in localStorage
      const kanbanState = localStorage.getItem('kanban_column_state');
      const kanbanStateObj = kanbanState ? JSON.parse(kanbanState) : {};
      currentStatus = kanbanStateObj[task.id] || 'todo';
    }
    
    // Also check for the special marker in the description
    if (task.description && task.description.includes('[STATUS:in-progress]')) {
      currentStatus = 'in-progress';
    }
  }
  
  console.log('Editing task with status:', currentStatus, 'Task:', task);
  
  // Clean up the description by removing the status marker for display
  let cleanDescription = task.description || '';
  if (cleanDescription.includes('[STATUS:in-progress]')) {
    cleanDescription = cleanDescription.replace('[STATUS:in-progress] ', '');
  }
  
  editTaskForm.value = {
    id: task.id,
    title: task.title,
    description: cleanDescription,
    importance: task.importance || 'medium',
    status: currentStatus,
    // Store the original description with marker for reference
    originalDescription: task.description
  };
  showEditModal.value = true;
};

// Save task edit or create new task
const saveTaskEdit = async () => {
  if (!editTaskForm.value.title.trim()) return;
  
  // Create base task data that works for both database and dev mode
  const taskData = {
    title: editTaskForm.value.title.trim(),
    description: editTaskForm.value.description.trim(),
    importance: editTaskForm.value.importance,
    is_complete: editTaskForm.value.status === 'done'
  };
  
  // Handle the special marker in the description for in-progress tasks
  // This helps us identify them even without a status field
  if (editTaskForm.value.status === 'in-progress') {
    // Add the marker if it's not already there
    if (!taskData.description.includes('[STATUS:in-progress]')) {
      taskData.description = `[STATUS:in-progress] ${taskData.description}`;
    }
  } else {
    // Remove the marker if the task is no longer in progress
    // Check both the current description and the original description
    if (taskData.description.includes('[STATUS:in-progress]')) {
      taskData.description = taskData.description.replace('[STATUS:in-progress] ', '');
    } else if (editTaskForm.value.originalDescription && 
               editTaskForm.value.originalDescription.includes('[STATUS:in-progress]')) {
      // If the original had the marker but the current doesn't (because we cleaned it),
      // make sure we're not adding the marker back
      taskData.description = taskData.description;
    }
  }
  
  // Only add status for dev mode
  if (localStorage.getItem('dev_mode_user')) {
    taskData.status = editTaskForm.value.status;
  }
  
  // Set the _kanbanColumn property to track which column this task is in
  // This won't be sent to the database because we'll filter it out
  taskData._kanbanColumn = editTaskForm.value.status;
  
  // Save the kanban column state to localStorage
  const kanbanState = localStorage.getItem('kanban_column_state');
  const kanbanStateObj = kanbanState ? JSON.parse(kanbanState) : {};
  
  if (editTaskForm.value.id) {
    // For existing tasks, save the column state
    kanbanStateObj[editTaskForm.value.id] = editTaskForm.value.status;
  }
  
  localStorage.setItem('kanban_column_state', JSON.stringify(kanbanStateObj));
  
  if (editTaskForm.value.id) {
    // Update existing task
    await taskStore.updateTask(editTaskForm.value.id, taskData);
  } else {
    // Create new task
    // Get the current user ID from the user store
    const userStore = useUserStore();
    await userStore.fetchUser(); // Make sure we have the latest user data
    
    // Get the current user from Supabase directly
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    if (!userId) {
      console.error('No authenticated user found');
      toastStore.error('You must be logged in to create tasks');
      return;
    }
    
    console.log('Creating task with user ID:', userId);
    
    await taskStore.createTask(
      taskData.title,
      taskData.description,
      userId,
      taskData.importance,
      editTaskForm.value.status
    );
  }
  
  showEditModal.value = false;
};

// Cancel edit
const cancelEdit = () => {
  showEditModal.value = false;
};

// Create new task in a specific column
const createNewTask = (status) => {
  editTaskForm.value = {
    id: null,
    title: '',
    description: '',
    importance: 'medium',
    status: status
  };
  showEditModal.value = true;
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

// Toggle column collapse
const toggleColumn = (column) => {
  collapsedColumns.value[column] = !collapsedColumns.value[column];
};

// Format date for display
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

// Check if developer mode is enabled
const isDevMode = computed(() => {
  return !!localStorage.getItem('dev_mode_user');
});

// Toggle developer mode
const toggleDevMode = () => {
  if (isDevMode.value) {
    // Disable dev mode
    localStorage.removeItem('dev_mode_user');
    localStorage.removeItem('dev_mode_tasks');
  } else {
    // Enable dev mode
    localStorage.setItem('dev_mode_user', 'dev-user-123');
  }
  
  // Refresh tasks
  taskStore.fetchTasks();
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

.swimlane-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.dev-mode-toggle button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.dev-mode-toggle button.active {
  background-color: #4CAF50;
  color: white;
  border-color: #388E3C;
}

.dev-mode-toggle button:hover {
  background-color: #e0e0e0;
}

.dev-mode-toggle button.active:hover {
  background-color: #388E3C;
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
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background-color: var(--color-bg-secondary);
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
  
  .column-actions {
    margin-bottom: 1rem;
    padding: 0.5rem 0;
    border-bottom: 1px dashed var(--color-border);
  }
  
  .add-task-btn {
    background-color: var(--color-bg-tertiary);
    color: var(--color-text-primary);
    border: 1px dashed var(--color-border);
    border-radius: 4px;
    padding: 0.5rem 1rem;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .add-task-btn:hover {
    background-color: var(--color-bg-hover);
    border-color: var(--color-primary);
  }
  
  .add-task-btn .icon {
    margin-right: 0.5rem;
    font-size: 1.2rem;
  }
  
  /* Column header styling */
  .header-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .collapse-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  }
  
  .collapse-icon {
    transition: transform 0.2s ease;
    font-size: 0.8rem;
  }
  
  .collapse-icon.collapsed {
    transform: rotate(-90deg);
  }
  
  .column-content {
    transition: max-height 0.3s ease, opacity 0.3s ease;
    overflow: hidden;
  }
  
  /* Enhanced importance badges */
  .importance-badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-weight: bold;
    display: flex;
    align-items: center;
  }
  
  .importance-badge::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 4px;
  }
  
  .importance-high {
    background-color: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
  }
  
  .importance-high::before {
    background-color: #e74c3c;
  }
  
  .importance-medium {
    background-color: rgba(243, 156, 18, 0.1);
    color: #f39c12;
  }
  
  .importance-medium::before {
    background-color: #f39c12;
  }
  
  .importance-low {
    background-color: rgba(46, 204, 113, 0.1);
    color: #2ecc71;
  }
  
  .importance-low::before {
    background-color: #2ecc71;
  }
}
</style>