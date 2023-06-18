const express = require("express");

// this function is helping me with intellisense in vscode for express controllers
const controller = (callback = (req = express.request, res = express.response, next = () => {}) => {}) => {
  return callback;
};

module.exports = controller;
