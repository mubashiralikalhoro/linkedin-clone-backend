const express = require("express");
const appConfig = require("./src/config/appConfig");

// Constants
const PORT = appConfig.app.port;
const app = express();

// Middleware
app.use(express.json());

// app.use("/api/users", require("./routes/users"));

// Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
