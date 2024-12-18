require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/auth");
const cors = require('cors');
const listingsRouter = require('./routes/listings');
const profileRouter = require('./routes/profile');
const premiumRouter = require('./routes/premium');
const app = express();
const path = require('path');
const { initDatabase } = require('./database/init');

// Add this near the start of your server initialization
initDatabase()
  .then(() => {
    console.log('Database initialized successfully');
    // Start your server here if you want to ensure DB is ready first
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

app.use(express.json()); // For parsing JSON requests
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'PUT', 'POST'],
    credentials: true
  }));
  
// Mount routes
app.use("/auth", authRoutes);
app.use('/api/listings', listingsRouter);
app.use('/profile', profileRouter);
app.use('/api/premium', premiumRouter);
// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
