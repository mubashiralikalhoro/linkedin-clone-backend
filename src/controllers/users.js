const createController = require("../utils/createController");

// api/users
module.exports.get = createController((req, res) => {
  res.status(200).send([
    {
      id: 1,
      name: "John Doe",
    },
    {
      id: 2,
      name: "Jane Doe",
    },
  ]);
});

module.exports.create = createController((req, res) => {
  res.status(201).send({
    id: 1,
    name: "John Doe",
  });
});

// api/users/:id
module.exports.getById = createController((req, res) => {
  res.status(200).send({
    id: 1,
    name: "John Doe",
  });
});

module.exports.deleteById = controller((req, res) => {
  res.status(204).send();
});
