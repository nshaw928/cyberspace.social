# Product Requirements Document: Cyberspace Social

**Version:** 1.0  
**Last Updated:** October 30, 2025  
**Status:** Draft

## 1. Executive Summary

Cyberspace Social is a minimal social media application focused on authentic connection and photo sharing among small friend groups. The platform emphasizes meaningful interactions over vanity metrics by eliminating likes and limiting content visibility to mutual friends only.

## 2. Technical Stack

### 2.1 Backend
- **Framework:** Django with Django REST Framework
- **Database:** PostgreSQL
- **Authentication:** JWT (already implemented via httponly cookies)
- **Image Storage:** Database storage for profile pictures; filesystem for posts

### 2.2 Frontend
- **Framework:** React with Vite
- **Language:** TypeScript
- **UI Library:** Radix UI components with Tailwind CSS
- **State Management:** React hooks (useState, useContext)
- **Routing:** React Router DOM

### 2.3 Infrastructure
- **Web Server:** Nginx (reverse proxy)
- **Hosting:** Self-hosted on local network
- **Security:** SSL/HTTPS with certificate management
- **Target Audience:** Small group (<100 users)

## 3. Design Philosophy

### 3.1 Visual Identity
- **Theme:** Cyberpunk aesthetic
- **Color Scheme:** Dark mode with dark colors as primary palette
- **Feel:** Futuristic yet refined, intentionally designed
- **Usability:** Pleasing and intuitive interface

### 3.2 Core Principles
- Connection over metrics (no likes)
- Privacy-focused (comments visible only to poster and commenter)
- Minimal and intentional feature set
- Mobile-first with responsive desktop support

## 4. Functional Requirements

### 4.1 Authentication & User Management

#### 4.1.1 Registration
- **Status:** Already implemented
- **Requirements:**
  - Username (unique, enforced by Django)
  - Email (unique, enforced by Django)
  - Password (secure hashing)
  - Email verification required before account activation
  - Username uniqueness validation

#### 4.1.2 Login/Logout
- **Status:** Already implemented
- JWT tokens in httponly cookies
- Secure flag enabled, SameSite='None'

#### 4.1.3 Password Management
- Password reset functionality via email
- Secure password requirements (Django defaults)

#### 4.1.4 User Profile Fields
- Profile picture (stored in database)
- Name (display name, not unique)
- Username (unique identifier)
- Bio (max 255 characters)
- Link (valid URL format validation)
- Email (editable via settings)
- ~~Phone number~~ (removed from requirements)

### 4.2 Navigation & Layout

#### 4.2.1 Top Bar (Fixed, Non-Scrolling)
**Mobile Layout:**
- Left: Application logo
- Center: "cyberspace.social" text
- Right: Friends icon (navigates to friend management)

**Desktop Layout:**
- Same as mobile

#### 4.2.2 Bottom Navigation Bar
**Mobile Layout:**
- Icon-based navigation
- Two main pages: Home Feed, User Profile

**Desktop Layout:**
- Moved to side navigation
- Icons with page names displayed
- Same functionality as mobile

### 4.3 Home Feed Page

#### 4.3.1 Feed Display
- Shows posts from friends only (mutual friendships)
- Chronological order (most recent first)
- Infinite scroll pagination (10 posts per page)
- Pull-to-refresh at top of feed
- Auto-load next 10 posts when scrolling to bottom

#### 4.3.2 Post Card Structure
**Layout:** 1 column, 3 rows

**Row 1 - Header:**
- Left: User's profile picture (circular)
- Left: User's display name (clickable)
- Clicking profile picture or name → navigate to that user's profile

**Row 2 - Image:**
- Full-width post image
- Square aspect ratio
- Optimized/compressed format

**Row 3 - Footer:**
**Elements (in order):**
1. Caption text (max 255 characters, supports line breaks)
2. Comment interaction area
3. Timestamp (right-aligned)

**Comment Interaction States:**

*Default State:*
- Comment icon button (left)
- Timestamp (right)

*Active Comment State:*
- Full-width text input field (appears above buttons)
- Red "X" button (left) - cancels and closes input
- Enlarged "Send" button with icon (right) - submits comment
- Timestamp remains (right)

**Row 3 - Timestamp:**
- Format: Date and time of posting
- Position: Right-aligned
- Always visible below comment interface

### 4.4 User Profile Page

#### 4.4.1 Top Bar
- Center: Username displayed
- Right: Settings icon

#### 4.4.2 Profile Information Section
**Layout:** 2 columns

**Left Column (< 1/3 width):**
- Profile picture (large, circular)
- Left-aligned

**Right Column (> 2/3 width):**
- Row 1: Display name
- Row 2: Bio (max 255 characters)
- Row 3: Link (clickable URL)

#### 4.4.3 Posts Section
**Header Row:**
- Left: "Your Posts" text
- Right: "Add Post" button

**Grid Display:**
- **Mobile:** 3 columns
- **Desktop:** 5 columns
- Square thumbnails
- Click thumbnail → view full post with comments

**Add Post Modal:**
- Image upload field
- Caption input (max 255 characters)
- "Post" button (centered at bottom)
- Client-side image compression before upload
- Supported formats: JPEG, PNG
- Target size: Square fitting typical phone screens (recommend 1080x1080px)

#### 4.4.4 Post Detail View (When Clicked)
**For Post Owner:**
- Full-size image
- Caption
- Edit caption functionality
- Delete post functionality
- List of all comments with:
  - Commenter's profile picture
  - Commenter's name
  - Comment text
  - Delete button (X) for each comment

**For Commenter (viewing their own comment on someone else's post):**
- Can see their own comment
- Red "X" button next to their comment
- Delete confirmation popup: "Are you sure you want to delete this comment?"

#### 4.4.5 Settings Menu
**Editable Fields:**
- Name (text input)
- Username (text input with uniqueness validation)
- Bio (textarea, 255 char limit)
- Link (URL input with validation)
- Email (email input with uniqueness validation)

**Actions:**
- "Save Changes" button
- "Log Out" button

### 4.5 Friend Management Page

#### 4.5.1 Find Friends Section
- Search by username (exact match only)
- No autocomplete or suggestions
- Must type username exactly
- Display search result with "Add Friend" button
- Sends friend request (requires mutual approval)

#### 4.5.2 Friend Requests Section
- Only displays if pending requests exist
- Section header: "Friend Requests"

**Request Card:**
- Profile picture (left)
- Name and username (center)
- "Accept" button (right)
- "Decline" button (right)

**Actions:**
- Accept → mutual friendship created
- Decline → request deleted

#### 4.5.3 Your Friends Section
- Header: "Your Friends (X)" where X = friend count
- Maximum 5,000 friends per user

**Friend Card:**
- Profile picture (left)
- Name and username (center)
- Red "X" button (right)

**Remove Friend Action:**
- Confirmation popup: "Are you sure you want to remove this friend?"
- Confirm → friendship deleted (bidirectional)
- Cancel → no action

### 4.6 Comments System

#### 4.6.1 Comment Visibility Rules
- Comments visible ONLY to:
  1. The post owner
  2. The person who wrote the comment
- No one else can see any comments

#### 4.6.2 Comment Features
- No character limit on comments
- No editing allowed (only delete)
- Post owner can delete any comment on their posts
- Commenter can delete their own comments
- Delete requires confirmation popup

#### 4.6.3 Comment Display
**On Feed:**
- Commenter sees their own comments under posts

**On Profile (Post Detail View):**
- Post owner sees all comments
- Commenter sees only their own comments when viewing others' posts

### 4.7 Business Rules & Limits

#### 4.7.1 Posting Limits
- Maximum 1,000 posts per user
- Rate limit: 1 post per 5 minutes
- Rate limit resets if previous post is deleted
- Client-side image compression required

#### 4.7.2 Friend Limits
- Maximum 5,000 friends per user
- Bidirectional relationship required
- Both users must approve friendship

#### 4.7.3 Content Limits
- Caption: 255 characters max
- Bio: 255 characters max
- Username: Django default limits
- No content moderation features

#### 4.7.4 Data Retention
- Deleted posts → permanent deletion (no retention)
- Deleted comments → permanent deletion
- No user data export functionality
- Database backups handled at infrastructure level

## 5. Non-Functional Requirements

### 5.1 Performance
- Feed pagination: 10 posts per load
- Image compression on client before upload
- Efficient database queries (select_related, prefetch_related)
- Lazy loading for images

### 5.2 Security
- HTTPS/SSL required for all connections
- JWT tokens in httponly cookies
- CSRF protection enabled
- Email verification for new accounts
- Password reset via secure token
- Input validation and sanitization
- SQL injection protection (Django ORM)

### 5.3 Scalability
- Designed for small user base (<100 users)
- Self-hosted on local network
- No CDN or regional servers required
- Single server deployment

### 5.4 Responsive Design
**Mobile (< 768px):**
- Bottom navigation bar with icons
- 3-column post grid on profile
- Touch-optimized interactions

**Desktop (≥ 768px):**
- Side navigation bar with icons + labels
- 5-column post grid on profile
- Mouse-optimized interactions

### 5.5 Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript support required
- No IE11 support needed

## 6. Technical Architecture

### 6.1 Database Schema (PostgreSQL)

**Users (extends Django User model):**
- id (PK)
- username (unique)
- email (unique)
- password_hash
- is_verified (boolean)
- created_at
- updated_at

**Profiles:**
- id (PK)
- user_id (FK → Users, one-to-one)
- display_name
- bio (varchar 255)
- link (URL)
- profile_picture (binary/blob storage)
- created_at
- updated_at

**Posts:**
- id (PK)
- user_id (FK → Users)
- image_path (filesystem path)
- caption (varchar 255)
- created_at
- updated_at

**Comments:**
- id (PK)
- post_id (FK → Posts)
- user_id (FK → Users)
- comment_text (text)
- created_at

**Friendships:**
- id (PK)
- user_id_1 (FK → Users)
- user_id_2 (FK → Users)
- status (enum: pending, accepted)
- requester_id (FK → Users)
- created_at
- updated_at
- UNIQUE constraint on (user_id_1, user_id_2)

**Indexes:**
- Posts: user_id, created_at (for feed queries)
- Comments: post_id, user_id
- Friendships: user_id_1, user_id_2, status

### 6.2 API Endpoints (REST)

**Authentication:**
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/verify-email
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

**Profile:**
- GET /api/profile/:username
- PUT /api/profile/me
- POST /api/profile/picture
- GET /api/profile/picture/:username

**Posts:**
- GET /api/posts/feed?page=1&limit=10
- GET /api/posts/:id
- POST /api/posts
- PUT /api/posts/:id (caption only)
- DELETE /api/posts/:id
- GET /api/posts/user/:username

**Comments:**
- GET /api/posts/:id/comments
- POST /api/posts/:id/comments
- DELETE /api/comments/:id

**Friends:**
- GET /api/friends
- GET /api/friends/requests
- POST /api/friends/search
- POST /api/friends/request
- PUT /api/friends/accept/:id
- DELETE /api/friends/decline/:id
- DELETE /api/friends/:id

### 6.3 Nginx Configuration
- Reverse proxy to Django application
- SSL/TLS termination
- Static file serving (React build)
- Media file serving (uploaded images)
- Rate limiting
- Gzip compression

### 6.4 Image Handling
**Profile Pictures:**
- Storage: PostgreSQL database (binary)
- Format: JPEG or PNG
- Max size: 500KB
- Client-side compression
- Dimensions: 400x400px recommended

**Post Images:**
- Storage: Filesystem (media directory)
- Format: JPEG or PNG
- Client-side compression before upload
- Target dimensions: 1080x1080px (square)
- Quality: 85% JPEG compression
- Max file size: 2MB after compression

## 7. User Stories

### 7.1 Core User Flows

**As a new user:**
- I can register with email, username, and password
- I must verify my email before accessing the app
- I can set up my profile with name, bio, link, and profile picture

**As a logged-in user:**
- I can view a feed of posts from my friends in chronological order
- I can scroll infinitely through the feed (10 posts at a time)
- I can pull-to-refresh to see new posts
- I can click on a friend's name/picture to view their profile

**As a content creator:**
- I can upload a photo with a caption (once every 5 minutes)
- I can edit the caption of my posts
- I can delete my posts
- I can view all comments on my posts
- I can delete comments on my posts

**As a content consumer:**
- I can comment on friends' posts
- I can delete my own comments with confirmation
- I can see my comments on posts in the feed
- I cannot edit comments after posting

**As a friend-seeker:**
- I can search for users by exact username
- I can send friend requests
- I can accept or decline incoming friend requests
- I can remove friends with confirmation

**As a profile manager:**
- I can edit my name, username, bio, link, and email
- I can upload/change my profile picture
- I can log out

## 8. Out of Scope (Future Considerations)

- Flutter mobile app (planned for future)
- Push notifications
- In-app notifications
- Direct messaging
- Stories/temporary content
- Video posts
- Multi-image posts
- Post analytics
- User blocking
- Content reporting
- Like/reaction system
- Comment replies/threading
- Search by name or bio
- Friend suggestions
- Mutual friend visibility
- Account privacy settings (public/private)
- Data export functionality
- Third-party integrations

## 9. Success Metrics

Since this is for a small, private group:
- System uptime and reliability
- Page load times (<2s for feed)
- Image upload success rate
- Zero data loss incidents
- User satisfaction (informal feedback)

## 10. Development Phases

### Phase 1: Backend Foundation (Current)
- ✓ Django setup
- ✓ User authentication
- ✓ JWT cookies
- ⚠ Migrate from SQLite to PostgreSQL
- ⚠ Email verification
- ⚠ Password reset

### Phase 2: Core Models & API
- Profile model and API
- Post model and API
- Comment model and API
- Friendship model and API
- Image upload handling
- Client-side image compression

### Phase 3: Frontend - Feed & Profile
- Home feed with infinite scroll
- Post card component
- Comment interface
- User profile page
- Post grid
- Add post modal

### Phase 4: Frontend - Social Features
- Friend management page
- Friend search
- Friend requests UI
- Settings page

### Phase 5: Polish & Infrastructure
- Cyberpunk theme implementation
- Responsive design (mobile + desktop)
- Nginx configuration
- SSL/HTTPS setup
- Rate limiting
- Error handling and validation

### Phase 6: Testing & Deployment
- Integration testing
- Security testing
- Performance optimization
- Production deployment
- User onboarding

## 11. Open Questions & Decisions Needed

1. **Profile Picture Storage:** Confirm database storage vs filesystem for profile pictures
2. **Email Service:** Which email service provider (SMTP, SendGrid, etc.)?
3. **SSL Certificate:** Self-signed or Let's Encrypt?
4. **Image Compression Library:** Which client-side library (browser-image-compression, compressorjs)?
5. **Backup Strategy:** Frequency and retention for database backups?
6. **Domain Name:** Will there be a custom domain or IP-based access?

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Self-hosted server downtime | High | UPS, monitoring, backup hardware |
| Database corruption | High | Regular automated backups, WAL archiving |
| Image storage fills disk | Medium | Storage monitoring, post limits per user |
| Network security breach | High | SSL/HTTPS, firewall rules, regular updates |
| Email verification failures | Medium | Fallback email service, manual verification option |
| Rate limiting bypassed | Low | Server-side validation, IP-based limiting |

## 13. Appendix

### 13.1 Glossary
- **Mutual Friendship:** Bidirectional relationship where both users have accepted
- **Post Owner:** User who created a post
- **Commenter:** User who wrote a comment
- **Feed:** Chronological list of posts from friends

### 13.2 References
- Django Documentation: https://docs.djangoproject.com/
- React Documentation: https://react.dev/
- Nginx Documentation: https://nginx.org/en/docs/
- PostgreSQL Documentation: https://www.postgresql.org/docs/

---

**Document Owner:** CTO  
**Stakeholders:** Development Team, Product Owner  
**Review Cycle:** Bi-weekly or as needed
