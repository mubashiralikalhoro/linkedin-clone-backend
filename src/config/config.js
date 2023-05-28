require("dotenv").config();
module.exports = {
  app: {
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  db: {
    server: process.env.DB_ENDPOINT,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    options: {
      trustServerCertificate: true,
    },
  },
};
