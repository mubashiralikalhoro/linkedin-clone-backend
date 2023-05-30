const createController = require("../utils/createController");
const s3 = require("../utils/s3");

module.exports.getImage = createController(async (req, res) => {
  const readStream = await s3.getFile(`uploads/${req.params.key}`);
  readStream.pipe(res);
});
