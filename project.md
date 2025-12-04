# **FAMILY TREE – Project Documentation**

A full‑stack family‑management web app built using **React**, **Express**, **pg**, and **PostgreSQL**.

---

## ⭐ **Project Overview**

"FAMILY TREE" ek web application hoga jisme user apne family members, relations aur complete genealogy ko manage kar sakta hai. Project ko hum **step‑by‑step** Hinglish explanation ke saath build karenge.

---

## 🛠 **Tech Stack**

* **Frontend:** React.js
* **Backend:** Express.js
* **Database Driver:** pg (Node PostgreSQL client)
* **Database:** PostgreSQL

---

# 📌 **Step 1: User Signup Flow (Required Screen)**

Website open hote hi **Signup Page** dikhna chahiye. Yeh mandatory hoga website access karne ke liye.

### ✨ Required User Fields

* **Profile Image** (upload)
* **Email**
* **First Name**
* **Last Name**
* **Password**

### 🧭 Step by Step (Hinglish Explanation)

1. **User website open karega** → seedha **Signup page** open hoga.
2. User apni **details fill** karega: image, email, name, lastname, password.
3. Details submit hone ke baad backend validate karega.
4. Password ko securely hash karke database me store kiya jayega.
5. Signup success hone ke baad user ko **Main UI / Dashboard** par redirect kara diya jayega.

---

# 🏗 **Project Structure (Folder Layout)**

```
FAMILY_TREE/
│
├── client/               # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
│
├── server/               # Express backend
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── db/
│   │   └── index.js
│   ├── server.js
│   └── package.json
│
├── database/             # PostgreSQL schema
│   ├── tables.sql
│   └── seed.sql
│
└── README.md
```

---

# 🗄 **Database Designing**

### **Users Table**

| Column Name     | Type           | Description                                  |
| --------------- | -------------- | -------------------------------------------- |
| id              | SERIAL PRIMARY KEY | Unique user ID                               |
| profile_img_url | TEXT           | URL to the profile image in cloud storage    |
| email           | VARCHAR(255) UNIQUE NOT NULL | User's email address                       |
| first_name      | VARCHAR(100) NOT NULL | User's first name                          |
| last_name       | VARCHAR(100) NOT NULL | User's last name                           |
| password_hash   | TEXT NOT NULL  | Hashed password using bcrypt               |
| created_at      | TIMESTAMPTZ DEFAULT NOW() | Timestamp with timezone of record creation |
| updated_at      | TIMESTAMPTZ DEFAULT NOW() | Timestamp of the last record update        |

---

# 🔧 **API Endpoints – Signup System**

### **POST /api/auth/signup**

**Description:** Creates a new user. The request must be `multipart/form-data` to handle the image upload.

**Request Body (form-data):**

```json
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "123456",
  "profile_image": "[file]" // The actual image file
}
```

**Response Example:**

```json
{
  "message": "Signup successful",
  "userId": 12
}
```

---

# 🎨 **UI/UX – Signup Page Features**

* Clean and minimal design
* Profile image preview
* Input validation (email format, password length)
* Error messages (invalid email, missing fields)
* Full responsive layout

---

# 🚀 **After Signup: Main UI (Step 2)**

Signup complete hote hi user ko **Main Dashboard** dikhega.

Is section me baad me hum:

* Family tree visualization
* Member add/edit system
* Relationship mapping
* User profile section

ka flow define karenge.

---

# 📅 **Next Steps (Project Roadmap)**

1. **Signup + Login system complete karna**
2. JWT based authentication add karna
3. Main dashboard UI banana
4. Family members table create karna
5. Relation mapping logic banana
6. Tree visualization build karna

---

# 🎯 Final Note

Yeh documentation aapke "FAMILY TREE" project ka **professional base structure** provide karta hai. Aage ke sab steps hum isi ke basis par detail me build karenge. Let me know jab aap **Step 2** start karna chahte ho! 🚀
