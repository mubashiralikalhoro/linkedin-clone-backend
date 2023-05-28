const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // check if token exists
  if (req.headers?.authorization) {
    const token = req.headers?.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // invalid token
    if (!decodedToken?.id) {
      res.status(401).send({
        data: null,
        error: "Unauthorized User",
      });
      return;
    }
    // check if user exists
    else {
      // TODO: check if user exists from database
    }
    // valid token
    req.userId = decodedToken.id;
  }
  // no token
  else {
    res.status(401).send({
      data: null,
      error: "Unauthorized User",
    });
    return;
  }

  // continue to next middleware
  next();
};
