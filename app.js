// Imports
const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const appConfig = require("./src/config/config");
const verifyJwt = require("./src/middleware/verifyJwt");

// Constants
const PORT = appConfig.app.PORT;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// :::: images
app.use("/images", require("./src/routes/images"));
// :::: auth
app.use("/api/auth", require("./src/routes/auth"));
// :::: app
app.use("/api/users", verifyJwt, require("./src/routes/users"));
app.use("/api/posts", verifyJwt, require("./src/routes/posts"));
app.use("/api/connections", verifyJwt, require("./src/routes/connections"));
app.use("/api/skills", verifyJwt, require("./src/routes/skills"));

// Server with DB connection
sql
  .connect(appConfig.db)
  .then((pool) => {
    console.log("Connected to  SQL SERVER on GOOGLE CLOUD successfully");
    // passing db connection to app
    app.locals.db = pool;
    // starting server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error creating connection pool :", err.message);
  });
