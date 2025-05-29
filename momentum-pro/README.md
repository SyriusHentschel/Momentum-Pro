```
  __  __                            _                     ____           
 |  \/  | ___  _ __ ___   ___ _ __ | |_ _   _ _ __ ___  |  _ \ _ __ ___ 
 | |\/| |/ _ \| '_ ` _ \ / _ \ '_ \| __| | | | '_ ` _ \ | |_) | '__/ _ \
 | |  | | (_) | | | | | |  __/ | | | |_| |_| | | | | | ||  __/| | | (_) |
 |_|  |_|\___/|_| |_| |_|\___|_| |_|\__|\__,_|_| |_| |_||_|   |_|  \___/
```

## By Victor Valerio
### Last updated for deployment: Current Version


Momentum Pro is a modern task management application built with Vue 3 and Supabase. It helps users organize their tasks, track progress, and boost productivity with a clean, intuitive interface.

![Momentum Pro Screenshot](public/screenshot.png)

## Features

- **User Authentication**: Secure login with email/password or GitHub OAuth
- **Task Management**: Create, edit, delete, and organize tasks
- **Drag-and-Drop Interface**: Easily reorder tasks to prioritize your work
- **Customizable Themes**: Choose from multiple theme options to personalize your experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Profile Management**: Customize your profile with avatar and personal information
- **Preference Settings**: Set default filters, sorting, and display options

## Technology Stack

- **Frontend**: Vue 3, Vue Router, Pinia (State Management)
- **Backend**: Supabase (Authentication, Database, Storage)
- **Build Tools**: Vite, npm
- **Styling**: Custom CSS with theme support
- **Deployment**: Netlify

## Getting Started

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

3. Create a `.env.local` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_AUTH_REDIRECT_URL=http://localhost:3000/auth/callback
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready to be deployed to your hosting platform of choice.

## Project Structure

```
momentum-pro/
├── public/             # Static assets
├── src/
│   ├── assets/         # Project assets (images, fonts, etc.)
│   ├── components/     # Reusable Vue components
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

## Development

### Key Concepts

- **Authentication Flow**: Handled by Supabase with email/password and OAuth providers
- **State Management**: Uses Pinia with persistence for managing application state
- **Routing**: Vue Router with navigation guards for protected routes
- **Theme System**: Custom theme implementation with CSS variables

### Developer Mode

For developers, there's a special developer mode that can be enabled in the profile settings. This mode is only available to authorized developer accounts and provides additional debugging tools.

## Deployment

See the [Deployment Plan](deployment-plan.md) for detailed instructions on deploying Momentum Pro to production.

## Testing

See the [Testing Plan](testing-plan.md) for comprehensive testing procedures.

## Documentation

See the [Documentation Plan](documentation-plan.md) for all available documentation.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Vue.js team for the amazing framework
- Supabase team for the powerful backend platform
- All contributors who have helped shape this project

---

## Contact & Support

For questions or support, please contact us:
- Email: support@momentumpro.com
- Phone: (555) 123-4567
- Website: [www.momentumpro.com](https://www.momentumpro.com)

---

Copyright © 2025 Momentum Pro. All rights reserved.
