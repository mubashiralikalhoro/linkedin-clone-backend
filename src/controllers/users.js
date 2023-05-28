const User = require("../models/User");
const createController = require("../utils/createController");
const executeQuery = require("../utils/executeQuery");

// api/users/:id
module.exports.getById = createController(async (req, res) => {
  const { result, error } = await executeQuery(
    User.getSelectQuery(req.params.id)
  );
  if (error) {
    res.status(500).send({
      data: null,
      error: error,
    });
    return;
  }

  res.status(200).send({
    data: result,
    error: null,
  });
});

// api/users/me
module.exports.getMe = createController(async (req, res) => {
  console.log("users me", req.userId);
  const { result, error } = await executeQuery(User.getSelectQuery(req.userId));
  if (error) {
    res.status(500).send({
      data: null,
      error: error,
    });
    return;
  }

  res.status(200).send({
    data: result,
    error: null,
  });
});
