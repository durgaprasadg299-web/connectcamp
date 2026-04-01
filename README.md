# 🎓 Campus Connect Lite

A comprehensive event management system for educational institutions that connects students, clubs, and administrators in a seamless platform for organizing and participating in campus events.

## ✨ Features

### 👨‍🎓 Student Features
- **User Registration & Authentication**: Secure signup and login with email validation
- **Event Discovery**: Browse and view all campus events
- **Event Registration**: Register for events with ticket verification
- **Interactive Dashboard**: Personal dashboard with registered events
- **Real-time Notifications**: Get updates about event changes and registrations

### 🏛️ Club Features
- **Club Registration**: Dedicated signup process for campus clubs
- **Event Creation**: Create and manage events with detailed information
- **AI Event Analyzer**: Intelligent analysis for event planning and optimization
- **2D Layout Planner**: Visual planning tool for event layouts
- **Poster Upload**: Upload event posters and promotional materials

### 👨‍💼 Admin Features
- **User Management**: View and manage all users (students, clubs, admins)
- **Club Verification**: Verify and approve club registrations
- **System Oversight**: Monitor platform activity and event management
- **Data Analytics**: Access to system-wide statistics and reports

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### Frontend
- **HTML5** - Structure and content
- **CSS3** - Styling and animations
- **JavaScript (ES6+)** - Client-side logic
- **Responsive Design** - Mobile-friendly interface

### Additional Tools
- **Git** - Version control
- **GitHub** - Code repository
- **MongoDB Compass** - Database management

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git
- MongoDB Atlas account (or local MongoDB)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sujitha-1401/EventManagement.git
   cd EventManagement
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update the following variables in `.env`:
     ```env
     MONGODB_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_secure_jwt_secret_key
     PORT=5000
     ```

4. **Database Connection**
   - Ensure MongoDB Atlas cluster is running
   - Whitelist your IP address in Atlas network access
   - Verify connection string in `.env`

5. **Start the Application**
   ```bash
   npm start
   # or
   node server.js
   ```

6. **Access the Application**
   - Open browser to `http://localhost:5000`
   - Register as Student, Club, or Admin

## 📁 Project Structure

```
campus-connect-lite/
├── config/              # Database configuration
├── middleware/          # Authentication middleware
├── models/              # Mongoose schemas
├── public/              # Static files (HTML, CSS, JS)
│   ├── css/            # Stylesheets
│   └── js/             # Client-side JavaScript
├── routes/             # API endpoints
├── uploads/            # File uploads directory
├── .env.example        # Environment variables template
├── .gitignore         # Git ignore rules
├── package.json       # Dependencies and scripts
├── server.js          # Main application entry point
└── README.md          # Project documentation
```

## 🔧 API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Event Routes
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event (Club/Admin)
- `GET /api/events/:id` - Get specific event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### User Routes
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

### Notification Routes
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification

## 🔒 Security Features

- **Email Validation**: Prevents invalid email registrations
- **Password Hashing**: Secure password storage with bcrypt
- **JWT Authentication**: Token-based secure authentication
- **Input Validation**: Server-side validation for all inputs
- **Environment Variables**: Sensitive data stored securely

## 🧪 Testing

### Manual Testing
1. **Student Flow**: Register → Login → Browse Events → Register for Event
2. **Club Flow**: Register → Login → Create Event → Upload Poster → Use AI Analyzer
3. **Admin Flow**: Register → Login → View Users → Verify Clubs

### API Testing
- Use tools like Postman or Thunder Client
- Test all endpoints with appropriate authentication
- Verify error handling and validation

## 🚀 Deployment

### Environment Setup
1. Set up production MongoDB Atlas cluster
2. Configure environment variables
3. Set up hosting platform (Heroku, Vercel, AWS, etc.)

### Build Process
```bash
npm install --production
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Sujitha** - *Full Stack Developer* - [GitHub](https://github.com/Sujitha-1401)

## 🙏 Acknowledgments

- Thanks to the MongoDB Atlas team for reliable database services
- Inspired by campus event management needs
- Built with modern web technologies

---

**⭐ Star this repository if you found it helpful!**