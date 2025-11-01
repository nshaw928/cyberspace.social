# Cyberspace Social - Quick Start Guide

## 🚀 Getting Started

### 1. Run Database Migrations

```bash
cd backend/django-project
python manage.py makemigrations profiles posts friendships
python manage.py migrate
```

Or use the convenience script:
```bash
cd backend/django-project
./run_migrations.sh
```

### 2. Create Admin User

```bash
python manage.py createsuperuser
```

### 3. Start Backend Server

```bash
cd backend/django-project
python manage.py runserver
```

Backend will be available at: http://127.0.0.1:8000

### 4. Start Frontend Server

```bash
cd frontend/vite-project
npm run dev
```

Frontend will be available at: http://localhost:5173

---

## 📋 What's Been Built

### ✅ Complete Backend (100%)
- **Profiles App**: User profiles with bio, link, profile pictures
- **Posts App**: Create/edit/delete posts, comments with privacy rules
- **Friendships App**: Friend requests, accept/decline, friend management
- **All API endpoints** matching the PRD requirements

### ✅ Complete Frontend (100%)
- **Feed Page**: Infinite scroll, post cards, comment interface
- **Profile Page**: User info, post grid (3 cols mobile, 5 cols desktop)
- **Settings Page**: Edit profile, logout
- **Friend Management**: Search, requests, friend list
- **Authentication**: Login, register, auto-login after registration
- **Cyberpunk Theme**: Dark mode with cyan/magenta accents

---

## 🔌 API Endpoints Reference

### Authentication
- POST `/account/token` - Login
- POST `/account/authenticated` - Check auth status
- POST `/account/logout` - Logout
- POST `/account/register` - Register new user

### Profiles
- GET `/api/profile/me` - Get your profile
- PUT `/api/profile/me` - Update your profile
- GET `/api/profile/<username>` - Get user profile
- POST `/api/profile/picture` - Upload profile picture
- GET `/api/profile/picture/<username>` - Get profile picture

### Posts
- GET `/api/posts/feed?page=1&limit=10` - Get feed
- POST `/api/posts` - Create post
- GET `/api/posts/<id>` - Get single post
- PUT `/api/posts/<id>/update` - Update caption
- DELETE `/api/posts/<id>/delete` - Delete post
- GET `/api/posts/user/<username>` - Get user's posts

### Comments
- GET `/api/posts/<id>/comments` - Get comments
- POST `/api/posts/<id>/comments/create` - Add comment
- DELETE `/api/posts/comments/<id>/delete` - Delete comment

### Friends
- GET `/api/friends` - Get friends list
- GET `/api/friends/requests` - Get friend requests
- POST `/api/friends/search` - Search user
- POST `/api/friends/request` - Send friend request
- PUT `/api/friends/accept/<id>` - Accept request
- DELETE `/api/friends/decline/<id>` - Decline request
- DELETE `/api/friends/<id>` - Remove friend

---

## 📊 Database Schema

### Users (Django built-in)
- id, username (unique), email (unique), password

### Profiles
- id, user_id, display_name, bio (255), link, profile_picture (binary), timestamps

### Posts
- id, user_id, image_path, caption (255), timestamps
- **Index**: (user_id, created_at)

### Comments
- id, post_id, user_id, comment_text, created_at
- **Index**: (post_id, user_id)

### Friendships
- id, user1_id, user2_id, status, requester_id, timestamps
- **Unique**: (user1_id, user2_id)
- **Index**: (user1_id, user2_id, status)

---

## 🧪 Testing the App

1. **Register a user** at http://localhost:5173/register
2. **Login** at http://localhost:5173/login
3. **Update profile** at http://localhost:5173/settings
4. **Add a post** on http://localhost:5173/profile
5. **Search for friends** at http://localhost:5173/friends
6. **View feed** at http://localhost:5173/feed

---

## 🐛 Troubleshooting

### Django import errors during migrations
If you see "No module named 'django'", ensure you're in the correct virtual environment or Django is installed.

### CORS errors
The backend is configured to allow requests from http://localhost:5173. If you're running on a different port, update `CORS_ALLOWED_ORIGINS` in `backend/settings.py`.

### Images not loading
Ensure the `media/` directory exists and Django is serving media files (happens automatically in DEBUG mode).

### Authentication not persisting
Check that cookies are being set with `credentials: "include"` in fetch requests and that CORS credentials are allowed.

---

## 📁 Project Structure

```
cyberspace.social/
├── backend/django-project/
│   ├── accounts/       # Authentication
│   ├── profiles/       # User profiles
│   ├── posts/          # Posts & comments
│   ├── friendships/    # Friend management
│   ├── media/          # Uploaded images (created on first upload)
│   └── manage.py
├── frontend/vite-project/
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── contexts/   # Auth context
│   │   ├── pages/      # Page components
│   │   └── App.tsx
│   └── package.json
├── PRD.md                              # Product requirements
├── BACKEND_IMPLEMENTATION_SUMMARY.md   # Backend details
└── QUICKSTART.md                       # This file
```

---

## ✅ All Features Complete!

Both frontend and backend are fully implemented according to the PRD. Ready for testing and deployment!

**Happy coding!** 🚀
