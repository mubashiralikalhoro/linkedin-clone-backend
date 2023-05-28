// Imports
const express = require("express");
const appConfig = require("./config/config");
const verifyJwt = require("./middleware/verifyJwt");

// Constants
const PORT = appConfig.app.PORT;
const app = express();

// Middleware
app.use(express.json());

// Routes
// :::: auth
app.use("/api/auth", require("./routes/auth"));
// :::: app
app.use("/api/users", verifyJwt, require("./routes/users"));

// Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
