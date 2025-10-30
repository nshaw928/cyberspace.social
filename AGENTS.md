# Agent Guidelines for cyberspace.social

## App Purpose
- cyberspace.social is a new socialmedia app that is designed to be a social media app that encourages users to connect with friends and avoids endless scrolling. The app will be simple and allow users to post photos.

## Features
- User registration and login
- Home page
    - Display photos from friends
    - Comment on photos from friends, but the comment is only visible to the friend who posted it
- Profile page
    - Shows user picture, name, username, bio, link
    - Shows list of photos in a grid
    - Allows access to settings


## Build/Lint/Test Commands
- **Frontend**: `cd frontend/vite-project && npm run dev` (dev), `npm run build` (build), `npm run lint` (lint)
- **Backend**: `cd backend/django-project && python manage.py runserver` (dev), `python manage.py test` (all tests), `python manage.py test <app>.<test_class>.<test_method>` (single test)
- **Frontend types**: `cd frontend/vite-project && tsc -b` (type check)

## Code Style - Frontend (React/TypeScript)
- **Imports**: Use `@/` alias for src imports (e.g., `@/components/ui/button`). Standard libraries → React → third-party → local components
- **Formatting**: 2-space indentation, semicolons optional but consistent, double quotes for JSX/strings
- **Types**: Use TypeScript for all files. Type function parameters explicitly. Use `React.FormEvent` for event handlers
- **Naming**: PascalCase for components/files, camelCase for variables/functions
- **Components**: Function components with named exports. useState for local state, props destructured in params
- **Error handling**: try/catch with user-friendly error states. Use `loading` and `error` state variables

## Code Style - Backend (Django/Python)
- **Imports**: Standard library → Django → third-party → local (DRF, then app imports)
- **Formatting**: 4-space indentation, PEP 8 compliant
- **Types**: No type hints currently used in codebase
- **Naming**: snake_case for functions/variables, PascalCase for classes
- **Views**: Use class-based views for complex logic, decorators (`@api_view`) for simple endpoints. Always include permission classes
- **Error handling**: Bare `except:` with `Response({'success': False})` pattern (current codebase style, though not ideal)
- **Auth**: JWT tokens stored in httponly cookies with `secure=True, samesite='None'`
