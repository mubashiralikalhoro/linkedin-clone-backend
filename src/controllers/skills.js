const createController = require("../utils/createController");
const { executeQuery } = require("../utils/executeQuery");

module.exports.getByUser = createController(async (req, res) => {
  let id = req.params.id;

  if (id === "me") {
    id = req.userId;
  }

  const { result, error } = await executeQuery(req.app.locals.db, `EXEC proc_get_user_skills @userId = ${id}`);

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

module.exports.getAll = createController(async (req, res) => {
  const { result, error } = await executeQuery(req.app.locals.db, `SELECT * FROM skills ORDER BY name ASC`);

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
