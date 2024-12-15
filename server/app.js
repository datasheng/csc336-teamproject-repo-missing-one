require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/auth");
const cors = require('cors');
const listingsRouter = require('./routes/listings');
const profileRouter = require('./routes/profile');
const app = express();

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
// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
