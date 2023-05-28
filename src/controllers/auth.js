const createController = require("../utils/createController");
const User = require("../models/User");
const executeQuery = require("../utils/executeQuery");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const logInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

module.exports.login = createController(async (req, res) => {
  const { error, value } = logInSchema.validate(req.body);

  console.log("value", value);

  // bad request
  if (error) {
    res.status(400).send({
      data: null,
      error: error.message,
    });
    return;
  }

  // check if user exists
  const userResponse = await executeQuery(
    User.getSelectUserByEmailQueryForLogin(value.email)
  );

  // internal server error
  if (userResponse.error) {
    res.status(500).send({
      data: null,
      error: userResponse.error,
    });
    return;
  }

  // user not found
  if (userResponse?.result?.length === 0) {
    res.status(404).send({
      data: null,
      error: "User not found",
    });
    return;
  }

  // check if password is correct
  const isPasswordCorrect = await bcrypt.compare(
    value.password,
    userResponse.result[0].password
  );

  if (!isPasswordCorrect) {
    res.status(401).send({
      data: null,
      error: "Password is incorrect",
    });
    return;
  }

  // generate jwt token
  const jwtToken = jwt.sign(
    {
      id: userResponse.result[0].id,
      email: userResponse.result[0].email,
    },
    config.app.JWT_SECRET
  );

  // remove password from response

  // success
  res.status(200).send({
    data: {
      jwt: jwtToken,
      ...userResponse.result[0],
    },
    error: null,
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

  // check if user exists
  const checkResponse = await executeQuery(
    User.getSelectUserByEmailQuery(value.email)
  );

  if (checkResponse.error) {
    res.status(500).send({
      data: null,
      error: checkResponse.error,
    });
    return;
  }

  // user already exists
  if (checkResponse?.result?.length > 0) {
    res.status(400).send({
      data: null,
      error: "User already exists",
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(value.password, 10);

  const user = User.getUserFromRequestBody({
    ...value,
    createdAt: new Date().toISOString(),
    password: hashedPassword,
  });

  const response = await executeQuery(user.getInsertQuery());
  if (response.error) {
    res.status(500).send({
      data: null,
      error: error,
    });
    return;
  }

  const userFromDB = await executeQuery(user.getSelectByEmailQuery());

  if (userFromDB?.result[0]?.password) {
    delete userFromDB.result[0].password;
  }

  const jwtToken = jwt.sign(
    {
      id: userFromDB.result[0].id,
      email: userFromDB.result[0].email,
    },
    config.app.JWT_SECRET
  );
  res.status(201).send({
    data: {
      jwt: jwtToken,
      ...userFromDB.result[0],
    },
    error: userFromDB.error,
  });
});
