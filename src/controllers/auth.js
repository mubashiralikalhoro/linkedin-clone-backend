const createController = require("../utils/createController");
const User = require("../models/User");
const executeQuery = require("../utils/executeQuery");

module.exports.login = createController((req, res) => {
  res.status(200).send({
    ok: true,
  });
});

module.exports.signup = createController(async (req, res) => {
  const { error, value } = User.validate(req.body);

  if (error) {
    res.status(400).send({
      data: null,
      error: error.message,
    });
    return;
  }

  const user = User.getUserFromRequestBody(req.body);

  const response = await executeQuery(user.getInsertQuery());
  if (response.error) {
    res.status(500).send({
      data: null,
      error: error,
    });
    return;
  }

  const userFromDB = await executeQuery(user.getSelectByEmailQuery());
  res.status(200).send({
    data: userFromDB.result[0],
    error: userFromDB.error,
  });
});
