const User = require("../models/User");
const createController = require("../utils/createController");
const executeQuery = require("../utils/executeQuery");

module.exports.getAll = createController(async (req, res) => {
  const { result, error } = await executeQuery(User.getSelectAllQuery());
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

module.exports.deleteById = createController((req, res) => {
  res.status(204).send();
});

module.exports.updateById = createController((req, res) => {
  res.status(200).send({
    id: 1,
    name: "John Doe",
  });
});
