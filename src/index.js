const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('../config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Start background jobs
require('../jobs/eventLifecycle');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Routes
app.get("/", (req, res) => {
  res.send("Backend is running");
});
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/events', require('../routes/eventRoutes'));
app.use('/api/admin', require('../routes/adminRoutes'));
app.use('/api/features', require('../routes/featureRoutes'));
app.use('/api/users', require('../routes/userRoutes'));
app.use('/api/venues', require('../routes/venueRoutes'));
app.use('/api/notifications', require('../routes/notificationRoutes'));

// Set static folder (after API routes)
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Catch all handler: send back index.html for client-side routing
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads') && req.accepts('html')) {
        return res.sendFile(path.join(__dirname, '../public', 'index.html'));
    }
    next();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));