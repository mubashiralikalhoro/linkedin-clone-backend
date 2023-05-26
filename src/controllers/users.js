const controller = require("../utils/controller");

module.exports.get = controller((req, res) => {
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

module.exports.getById = controller((req, res) => {
  res.status(200).send({
    id: 1,
    name: "John Doe",
  });
});
