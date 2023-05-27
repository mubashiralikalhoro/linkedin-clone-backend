// Imports
const express = require("express");
const appConfig = require("./config/config");
const sql = require("mssql");
const { config } = require("dotenv");

// Constants
const PORT = appConfig.app.PORT;
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));

// Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
