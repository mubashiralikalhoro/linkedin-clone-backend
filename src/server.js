// Imports
const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const appConfig = require("./config/config");
const verifyJwt = require("./middleware/verifyJwt");

// Constants
const PORT = appConfig.app.PORT;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// :::: images
app.use("/images", require("./routes/images"));
// :::: auth
app.use("/api/auth", require("./routes/auth"));
// :::: app
app.use("/api/users", verifyJwt, require("./routes/users"));

// Server with DB connection
sql
  .connect(appConfig.db)
  .then((pool) => {
    console.log("Connected to DB");
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
