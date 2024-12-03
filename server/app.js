require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/auth");
const cors = require('cors');

const app = express();

app.use(express.json()); // For parsing JSON requests
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }));
  
// Mount routes
app.use("/auth", authRoutes);

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
