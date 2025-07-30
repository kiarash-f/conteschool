# 🎨 Conte Art School Website

![React](https://img.shields.io/badge/Frontend-React-blue?logo=react)  
![Node.js](https://img.shields.io/badge/Backend-Node.js-green?logo=node.js)  
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?logo=mongodb)  
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)  
![Status](https://img.shields.io/badge/Status-Active-success.svg)  

A full-stack web application for **Conte Art School**, offering courses for children and adults.  
The platform includes features like online course registration, student portfolios, OTP authentication, and student reviews.  

---

## ✨ Features
- 🖼️ **Student Portfolios** – Showcase student artwork in a modern gallery.  
- 📚 **Courses for Kids & Adults** – Separate course structures with detailed schedules.  
- 📰 **News & Updates** – Announcements and upcoming events.  
- 👤 **Student Profiles** – Track enrolled courses, personal details, and activity.  
- 🔐 **Secure Authentication** – OTP-based signup and login via email or phone number.  
- 💳 **Online Payments** – Purchase courses and reserve spots online.  
- 🗓️ **Course Scheduling** – Organized schedules with availability indicators.  
- ⭐ **Student Reviews** – Rate and review courses and instructors.  

---

## 🖼️ Screenshots

### 1️⃣ Home Page
![Home Page](./screenshots/homepage.png)

### 2️⃣ Courses Page
![Courses Page](./screenshots/courses.png)

### 3️⃣ Student Dashboard
![Dashboard](./screenshots/dashboard.png)

*(Add your real screenshots in the `/screenshots` folder)*  

---

## 🛠️ Tech Stack

### Frontend
- **React (Vite)** – Modern, fast UI  
- **TailwindCSS** – Styling  
- **Axios** – API calls  

### Backend
- **Node.js + Express.js** – REST API  
- **MongoDB + Mongoose** – Database  
- **Multer** – File uploads (student portfolio images)  
- **JWT / OTP** – Authentication system  
- **Gzip + Static Caching** – Performance optimization  

---

## 📂 Project Structure

```
conte-school/
│
├── client/           # React frontend (Vite)
│   ├── src/          
│   └── public/       
│
├── server/           # Node.js backend
│   ├── models/       # Mongoose schemas
│   ├── controllers/  # API logic
│   ├── routes/       # API endpoints
│   ├── middleware/   
│   └── server.js     
│
├── screenshots/      # Project screenshots for README
└── README.md
```

---

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/conte-school.git
   cd conte-school
   ```

2. **Install dependencies**  
   - Frontend:
     ```bash
     cd client
     npm install
     ```
   - Backend:
     ```bash
     cd ../server
     npm install
     ```

3. **Setup environment variables**  
   Create a `.env` file in `server/` with:  
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   OTP_PROVIDER_KEY=your_otp_service_key
   ```

4. **Run the project**
   ```bash
   # Run backend
   cd server
   npm run dev

   # Run frontend (in another terminal)
   cd client
   npm run dev
   ```

---

## 🌐 Deployment

- **Frontend:** Vercel / Netlify  
- **Backend:** Liara / Render / Pars Pack  
- **Database:** MongoDB Atlas  

---

## 📜 API Documentation (Example)

### 🔑 Authentication

**1. Send OTP**
```
POST /api/auth/send-otp
```
Body:
```json
{
  "emailOrPhone": "user@example.com"
}
```

**2. Verify OTP**
```
POST /api/auth/verify-otp
```
Body:
```json
{
  "emailOrPhone": "user@example.com",
  "otp": "123456"
}
```

---

### 🎓 Courses

**1. Get all courses**
```
GET /api/courses
```

**2. Enroll in a course**
```
POST /api/courses/:courseId/enroll
```

*(Document all major endpoints in this section)*  

---

## 🔮 Future Improvements
- 📱 Progressive Web App (PWA) support  
- 🎨 AI-based portfolio curation  
- 📊 Admin dashboard with advanced analytics  

---

## 📜 License
This project is licensed under the **MIT License**.  

---

## 🤝 Contributing
Pull requests are welcome!  
For major changes, please open an issue first to discuss what you would like to change.  
