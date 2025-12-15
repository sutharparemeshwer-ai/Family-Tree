# 🌳 Family Tree - Full Stack Genealogy Application

A beautiful, modern family tree management application built with React and Node.js. Create, visualize, and manage your family genealogy and preserve precious memories.

![Family Tree Demo](./demo-screenshot.png)

## ✨ Features

### 🎨 **Modern UI/UX**
- **Premium Glassmorphism Design**: Elegant semi-transparent interfaces with refined blur effects and consistent theme.
- **Dynamic Animations**: Enhanced particle effects, subtle hover animations, smooth transitions, and custom modal entry/exit.
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices, adapting gracefully.
- **Advanced Search**: Quickly find family members with a dynamic "Fly-To" animation on the tree.
- **Custom Date Picker**: Beautiful, professional, and customizable date selection for all date inputs.

### 👨‍👩‍👧‍👦 **Family Tree Visualization**
- **Interactive Canvas**: Utilizes **React Flow** for scalable, interactive tree visualization with smooth step connections.
- **Smart Auto-Layout**: Automatically positions members with balanced spacing for large trees, on a warm, subtle background.
- **Enhanced Node Interactions**: Click `+` buttons on any member to add relatives contextually. New `...` menu for **editing** or **deleting** members directly from the tree.
- **Print-Ready Export**: Download the tree as a high-resolution image (PNG) or a multi-page **PDF Family History Book**, with interactive elements automatically hidden for a clean export.

### 📸 **Memory Gallery**
- **Immersive Memory Cards**: Beautiful glassmorphism-styled cards with dynamic image/video previews and hover effects.
- **Create & Manage Memories**: Add titles, descriptions, and dates to preserve family stories.
- **Photo & Video Uploads**: Attach multiple photos and videos to each memory.
- **Responsive Grid Layout**: View memories associated with each family member in an elegant, responsive grid layout.
- **Video Previews**: Videos automatically play on hover for a dynamic experience.
- **Custom Deletion Confirmation**: Replaced browser `confirm` with a custom, beautiful modal for deleting memories.

### 📅 **Family Event Reminders**
- **Upcoming Events Widget**: Displays upcoming birthdays and anniversaries on the main dashboard.
- **Smart Date Calculation**: Automatically determines the next occurrence of yearly events.

### 🔗 **Shareable Trees**
- **Generate Secure Links**: Create unique shareable links for your family tree.
- **Permission Control**: Share with "View Only" or "Allow Editing" permissions.
- **Token-Based Access**: Securely access shared trees without requiring a user login.

### ⚙️ **User Profile Management**
- **Editable Profiles**: Users can update their name, email, and profile picture from a dedicated settings page, featuring a clean, glassmorphism form.
- **Secure Password Change**: Functionality to change passwords with current password verification.

### 🖼️ **Advanced Image Handling**
- **Anonymous Avatars**: Auto-generated SVG avatars with user initials and colors.
- **Profile Pictures**: Upload and display family member photos.
- **Loading States**: Smooth loading animations and error handling for images.

### 🔐 **Secure Authentication**
- **JWT Authentication**: Secure token-based authentication.
- **Password Hashing**: `bcrypt` for secure password storage.
- **Protected Routes**: Middleware protection for all sensitive operations.

### 📊 **Database Design**
- **PostgreSQL**: Robust relational database.
- **Relationship Mapping**: Foreign keys for complex family relationships.
- **Data Integrity**: Proper constraints and referential integrity across tables.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sutharparemeshwer-ai/family-tree.git
   cd family-tree
   ```

2. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb family_tree_db

   # Run the schemas in order
   psql -d family_tree_db -f database/tables.sql
   psql -d family_tree_db -f database/add_gender_column.sql
   psql -d family_tree_db -f database/memories_tables.sql
   psql -d family_tree_db -f database/share_tokens.sql # NEW: For sharing links
   psql -d family_tree_db -f database/add_dates_to_members.sql # NEW: For event reminders
   psql -d family_tree_db -f database/social_tables.sql # NEW: For comments

   # Grant permissions if your DB user is 'parm' (replace 'parm' with your actual username if different)
   # psql -d family_tree_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO parm;"
   # psql -d family_tree_db -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO parm;"
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   # Create the uploads folder for storing images and videos
   mkdir uploads
   ```

4. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

5. **Configure environment variables**

   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   JWT_SECRET=your_super_strong_and_long_jwt_secret_here
   DATABASE_URL=postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5432/family_tree_db
   ```

6. **Start the application**

   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm start
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd client
   npm start
   ```

7. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🏗️ Project Structure

```
family-tree/
├── client/                 # React frontend
│   ├── public/
│   │   └── uploads/        # Directory for profile and memory uploads
│   ├── src/
│   │   ├── components/    # Reusable UI components (e.g., AddMemberForm, EventsWidget, ActionBar, ShareModal, ConfirmationModal, CustomDatePicker)
│   │   ├── pages/         # Page components (e.g., Tree, Main, SharedTree, Login, Signup, Memories, Settings)
│   │   ├── utils/         # Utility functions (e.g., api, treeLayout, bookGenerator)
│   │   └── ...
│   └── package.json
├── server/                 # Express backend
│   ├── controllers/       # Route controllers (e.g., membersController, shareController, socialController, userController)
│   ├── routes/            # API routes (e.g., members, share, social, users, auth)
│   ├── middleware/        # Auth middleware
│   │   └── authMiddleware.js
│   ├── db/                # Database connection
│   │   └── index.js
│   ├── uploads/           # Directory for uploaded files (should be created manually or via script)
│   ├── server.js          # Main server entry point
│   └── ...
├── database/               # PostgreSQL schema & migrations
│   ├── tables.sql
│   ├── add_gender_column.sql
│   ├── memories_tables.sql
│   ├── share_tokens.sql      # For sharing links
│   ├── social_tables.sql     # For comments/social features
│   └── add_dates_to_members.sql # Birth/Anniversary dates
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **React Router** - Navigation
- **React Flow** - Advanced tree visualization
- **Axios** - HTTP client
- **JSPDF** - PDF generation
- **HTML-to-Image** - HTML element to image conversion
- **Download.js** - Client-side file downloads
- **Dagre** - Graph layout algorithm
- **CSS3** - Modern styling with animations
- **React Datepicker** - Custom date input components

### Backend
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **node-postgres (pg)** - PostgreSQL client for Node.js
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Multer** - File uploads

## 📡 API Endpoints (Updated)

### Authentication
- `POST /api/auth/signup` - User registration.
- `POST /api/auth/login` - User login.

### Family Members
- `GET /api/members` - Get all family members for the logged-in user.
- `POST /api/members` - Add a new family member.
- `PUT /api/members/:id` - NEW: Update an existing family member.
- `DELETE /api/members/:id` - NEW: Delete a family member.
- `GET /api/members/events` - Get upcoming birthdays and anniversaries.

### Memories
- `GET /api/memories?memberId={id}` - Get all memories for a specific family member.
- `POST /api/memories` - Create a new memory with photos/videos.
- `DELETE /api/memories/{id}` - Delete a specific memory.
- `GET /api/social/memories/:id/comments` - NEW: Get comments for a memory.
- `POST /api/social/memories/:id/comments` - NEW: Post a comment on a memory.

### User Profile
- `PATCH /api/users/profile` - Update the logged-in user's profile information.

### Sharing
- `POST /api/share/generate` - Generate a unique shareable token for the user's tree. (Auth required)
- `GET /api/share/:token` - Get tree data by share token (no auth required for viewing).
- `POST /api/share/:token/members` - Add a member to a shared tree if 'edit' permission is granted (no auth required, uses token for validation).

## 🎨 UI Components (Updated)

### AddMemberForm
A clean, modal-based form for adding **and editing** new members with profile image upload, **custom date pickers for Date of Birth, Anniversary, and Date of Death**.

### FamilyNode
Interactive cards for each family member with an integrated `+` menu to add new relatives and a `...` menu to **edit or delete** the member.

### ConfirmationModal
NEW: A beautiful, custom confirmation dialog to replace native browser alerts for delete operations.

### CustomDatePicker
NEW: A fully custom-styled date picker component for a consistent UI/UX.

### Tree Visualization
A hierarchical layout that visually represents the family structure with connection lines, now powered by **React Flow** with search, fly-to, and advanced export options. Exported images hide interactive UI elements.

### MemoryCard & Gallery
Displays memories with media in a responsive grid. Features hover-to-play video and an elegant glassmorphism design.

### Settings Form
A professional, two-column layout for updating user profile details and changing passwords, styled with glassmorphism.

### ActionBar
Floating bar in the Tree view with "Download Tree", "Share Tree", and "Family Book" options, now with professional SVG icons.

### EventsWidget
Displays upcoming birthdays and anniversaries on the Main dashboard.

## 🔒 Security Features

- **Password Hashing**: `bcrypt` with salt rounds.
- **JWT Tokens**: Secure, expiring authentication tokens.
- **Input Validation**: Server-side validation of incoming data.
- **SQL Injection Prevention**: Use of parameterized queries.
- **CORS Protection**: Configurable to restrict access to the frontend domain.
- **File Upload Security**: Type and size restrictions on uploaded files.
- **Share Link Security**: Token-based access with configurable permissions.

## 📱 Responsive Design

- **Desktop**: Full hierarchical layout with multi-column views.
- **Tablet**: Optimized spacing and touch targets.
- **Mobile**: Stacked layouts with scrollable sections for a seamless experience.

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push -u origin feature/amazing-feature`).
5. Open a Pull Request.



---

**Built with ❤️ by Paremeshwer Suthar**

*Create and manage your family legacy digitally!* 🌟