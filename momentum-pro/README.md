# ███╗   ███╗ ██████╗ ███╗   ███╗███████╗███╗   ██╗████████╗██╗   ██╗███╗   ███╗    ██████╗ ██████╗  ██████╗ 
# ████╗ ████║██╔═══██╗████╗ ████║██╔════╝████╗  ██║╚══██╔══╝██║   ██║████╗ ████║    ██╔══██╗██╔══██╗██╔═══██╗
# ██╔████╔██║██║   ██║██╔████╔██║█████╗  ██╔██╗ ██║   ██║   ██║   ██║██╔████╔██║    ██████╔╝██████╔╝██║   ██║
# ██║╚██╔╝██║██║   ██║██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║   ██║   ██║██║╚██╔╝██║    ██╔═══╝ ██╔══██╗██║   ██║
# ██║ ╚═╝ ██║╚██████╔╝██║ ╚═╝ ██║███████╗██║ ╚████║   ██║   ╚██████╔╝██║ ╚═╝ ██║    ██║     ██║  ██║╚██████╔╝
# ╚═╝     ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝    ╚═╝     ╚═╝  ╚═╝ ╚═════╝ 
                                                                                                            
# Momentum Pro

By Victor Valerio

A professional task management application built with Vue.js and Supabase that helps you keep moving forward.

## Description
This project is a modern todo application that allows users to:
- Create an account and authenticate
- Create, read, update, and delete tasks
- Mark tasks as complete/incomplete
- Persist data across sessions
- Organize tasks using a Kanban board with drag-and-drop functionality

## Project Overview

Momentum Pro is a comprehensive task management system built with Vue 3 and Vite, designed to help users organize their work efficiently. The application features a modern, responsive interface with a focus on usability and performance.

### Key Features

- **Kanban Board**: Drag-and-drop task management with customizable columns
- **User Authentication**: Secure login with email/password, Google, and GitHub OAuth options
- **Profile Management**: User profile customization and settings
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Developer Mode**: Special features for authorized developers

## Setup
To run this project locally:

```bash
# Install dependencies
$ npm install

# Configure environment variables
# Create a .env file with your Supabase credentials:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# VITE_AUTH_REDIRECT_URL=your_redirect_url (or leave unset for local development)

# Start the development server
$ npm run dev
```

## Project Structure
```
momentum-pro/
├── public/
│   └── _redirects
├── src/
│   ├── assets/
│   │   └── main.css
│   ├── components/
│   ├── pages/
│   ├── router/
│   │   └── index.js
│   ├── store/
│   │   ├── task.js
│   │   └── user.js
│   ├── App.vue
│   ├── main.js
│   └── supabase.js
├── .env
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

## Technology Stack

- **Frontend**: Vue 3 with Composition API
- **Build Tool**: Vite
- **State Management**: Pinia with persistence
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Styling**: Custom CSS with responsive design
- **Deployment**: Netlify

## Features
- User authentication (signup, login, logout)
- OAuth login with Google and GitHub
- Task management with CRUD operations
- Kanban board with drag-and-drop functionality
- Responsive design that works on all screen sizes
- State management with Pinia
- Persistent login state
- Profile customization
- Developer mode for authorized users

## Deployment

The application is configured for easy deployment to Netlify. The `_redirects` file ensures proper SPA routing.

### Deployment Steps

1. Set up environment variables in Netlify:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `VITE_AUTH_REDIRECT_URL`: Your production URL + `/auth/callback`

2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

3. Deploy the site and verify the authentication callback works correctly

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Run the development server: `npm run dev`

## Project Implementation Phases

### Phase 1: Project Setup & Authentication (Done)
- Initialize Vue.js project with Vite
- Set up project structure (components, pages, stores)
- Configure Supabase connection
- Implement basic user store
- Create authentication UI (signup/login forms)
- Implement user registration and login functionality

### Phase 2: Task Management Foundations (Done)
- Create task store with basic operations
- Design and implement task listing UI
- Add functionality to create new tasks
- Set up proper routing between auth and dashboard
- Ensure data persistence works correctly

### Phase 3: Complete Task Operations (Done)
- Implement task editing functionality
- Implement changing importance of already created tasks
- Add task completion toggle feature
- Create task deletion capability
- Improve error handling
- Add loading states and user feedback

### Phase 4: UI Enhancement & Refinement
1. Toast Notifications (Done)
   - Implement a toast store to manage notifications
   - Replace current notifications with toasts for actions like:
     - Task creation success/failure
     - Task update success/failure
     - Task deletion success/failure
     - Authentication events

2. Improve Overall Styling and User Experience (Done)
   - Refine color scheme and typography
   - Add consistent spacing and alignment
   - Improve form elements and buttons
   - Add hover/focus states for interactive elements
   - Enhance visual hierarchy

3. Add Responsive Design Elements (Done)
   - Implement proper media queries for different screen sizes
   - Create mobile-friendly task cards
   - Adjust layout for smaller screens
   - Ensure forms are usable on mobile devices
   - Test on various device sizes

4. Implement Task Filtering/Sorting
   - Add filter controls (All, Complete, Incomplete)
   - Add sorting options (Date, Importance, Alphabetical)
   - Implement the filtering/sorting logic
   - Save user preferences for filters/sorting

5. Add Animations for Better User Experience (Done)
   - Add transition animations for task cards (creation, deletion)
   - Implement smooth transitions between states
   - Add loading animations
   - Add micro-interactions for better feedback

6. Optimize Performance (Done)
   - Implement lazy loading where appropriate
   - Optimize component rendering
   - Add pagination for large task lists
   - Implement caching strategies
   - Optimize API calls

### Phase 5: Testing & Deployment
- Test all functionality thoroughly
- Fix any bugs or issues
- Add final polish
- Deploy to hosting platform
- Create documentation

---

## Contact & Support

For questions or support, please contact us:
- Email: support@momentumpro.com
- Phone: (555) 123-4567
- Website: [www.momentumpro.com](https://www.momentumpro.com)

---

Copyright © 2025 Momentum Pro. All rights reserved.
