# Momentum Pro

A professional task management application built with Vue.js and Supabase that helps you keep moving forward.

## Description
This project is a modern todo application that allows users to:
- Create an account and authenticate
- Create, read, update, and delete tasks
- Mark tasks as complete/incomplete
- Persist data across sessions

## Setup
To run this project locally:

```bash
# Install dependencies
$ npm install

# Configure environment variables
# Create a .env file with your Supabase credentials:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start the development server
$ npm run dev
```

## Project Structure
```
momentum-pro/
├── public/
├── src/
│   ├── assets/
│   │   └── main.css
│   ├── components/
│   ├── router/
│   │   └── index.js
│   ├── store/
│   │   ├── task.js
│   │   └── user.js
│   ├── views/
│   │   ├── Auth.vue
│   │   └── Dashboard.vue
│   ├── App.vue
│   ├── main.js
│   └── supabase.js
├── .env
├── .eslintrc.js
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

## Features
- User authentication (signup, login, logout)
- Task management with CRUD operations
- Responsive design that works on all screen sizes
- State management with Pinia
- Persistent login state

## Technologies Used
- Vue.js 3
- Vue Router
- Pinia for state management
- Supabase for backend and authentication
- Vite as build tool
- ESLint for code quality
