# Momentum Pro Developer Guide

This guide provides technical information for developers working on the Momentum Pro application.

## Table of Contents

1. [Project Setup](#project-setup)
2. [Architecture Overview](#architecture-overview)
3. [Key Components](#key-components)
4. [State Management](#state-management)
5. [Authentication](#authentication)
6. [Database Schema](#database-schema)
7. [Development Workflow](#development-workflow)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Developer Mode](#developer-mode)

## Project Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v7 or higher)
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SyriusHentschel/Momentum-Pro.git
   cd momentum-pro
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_AUTH_REDIRECT_URL=http://localhost:3000/auth/callback
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Architecture Overview

Momentum Pro is built with the following technologies:

- **Frontend**: Vue 3 with Composition API
- **State Management**: Pinia with persistence
- **Routing**: Vue Router
- **Backend**: Supabase (Authentication, Database, Storage)
- **Build Tool**: Vite

### Directory Structure

```
momentum-pro/
├── public/             # Static assets
├── src/
│   ├── assets/         # Project assets (images, fonts, etc.)
│   ├── components/     # Reusable Vue components
│   │   ├── common/     # Common UI components
│   │   ├── layout/     # Layout components
│   │   └── tasks/      # Task-related components
│   ├── pages/          # Page components
│   ├── router/         # Vue Router configuration
│   ├── store/          # Pinia stores
│   ├── App.vue         # Root component
│   ├── main.js         # Application entry point
│   └── style.css       # Global styles
├── .env.example        # Example environment variables
├── index.html          # HTML template
├── package.json        # Project dependencies and scripts
└── vite.config.js      # Vite configuration
```

## Key Components

### Core Components

- **App.vue**: The root component that sets up the application layout
- **TaskList.vue**: Displays and manages the list of tasks
- **TaskItem.vue**: Individual task component with edit/delete functionality
- **TaskForm.vue**: Form for creating and editing tasks
- **ProfilePage.vue**: User profile management
- **Auth.vue**: Authentication pages (login, register, password reset)

### Utility Components

- **Modal.vue**: Reusable modal dialog component
- **Toast.vue**: Notification system
- **Dropdown.vue**: Dropdown menu component
- **Button.vue**: Styled button component
- **ThemeProvider.vue**: Manages theme application

## State Management

Momentum Pro uses Pinia for state management with the following stores:

### User Store

Located in `src/store/user.js`, manages:
- User authentication state
- User profile data
- Login/logout functionality

### Tasks Store

Located in `src/store/tasks.js`, manages:
- Task CRUD operations
- Task filtering and sorting
- Task statistics

### Preferences Store

Located in `src/store/preferences.js`, manages:
- Theme preferences
- UI settings
- Default filters and sorts

### Toast Store

Located in `src/store/toast.js`, manages:
- Application notifications
- Success/error messages

## Authentication

Authentication is handled through Supabase with the following features:

- Email/password authentication
- GitHub OAuth integration
- Password reset functionality
- Protected routes using navigation guards

The authentication flow is managed in the User store and Auth components.

## Database Schema

### Tables

**users**
- Managed by Supabase Auth

**profiles**
- `id`: UUID (references auth.users.id)
- `display_name`: Text
- `bio`: Text
- `avatar_url`: Text (URL to avatar image)
- `created_at`: Timestamp
- `updated_at`: Timestamp

**tasks**
- `id`: UUID
- `user_id`: UUID (references auth.users.id)
- `title`: Text
- `description`: Text
- `is_complete`: Boolean
- `importance`: Text ('low', 'medium', 'high')
- `due_date`: Timestamp
- `position`: Integer (for ordering)
- `created_at`: Timestamp
- `updated_at`: Timestamp

**preferences**
- `id`: UUID
- `user_id`: UUID (references auth.users.id)
- `theme`: Text
- `default_filter`: Text
- `default_sort`: Text
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Development Workflow

### Git Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "feat: Add your feature description"
   ```

3. Push your branch and create a pull request:
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or fixing tests
- `chore`: Changes to the build process or auxiliary tools

## Testing

### Manual Testing

Follow the [Testing Plan](testing-plan.md) for comprehensive testing procedures.

### Automated Testing

(Future implementation)

## Deployment

See the [Deployment Guide](DEPLOYMENT.md) for detailed deployment instructions.

## Developer Mode

Momentum Pro includes a special developer mode that can be enabled by authorized developers.

### Accessing Developer Mode

1. Log in with an authorized developer account (email must be in the approved list)
2. Go to your profile page
3. Click the "Preferences" tab
4. The "Developer Options" section will be visible if you're authorized
5. Click "Enable Development Mode"

### Developer Mode Features

- Bypasses authentication for easier testing
- Uses local storage instead of the database
- Provides additional debugging information
- Allows testing without affecting production data

### Adding Developer Accounts

To add a new developer account, edit the `isDeveloper` computed property in `ProfilePage.vue`:

```javascript
const isDeveloper = computed(() => {
  // List of authorized developer emails
  const developerEmails = [
    'existing@example.com',
    'new-developer@example.com'  // Add new developer email here
  ];
  
  // Check if the user's email is in the authorized list
  return user.value && developerEmails.includes(user.value.email);
});
```