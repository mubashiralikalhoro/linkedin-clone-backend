const sql = require("mssql");
const appConfig = require("../config/config");

module.exports = async (query) => {
  let result = null;
  let error = null;
  try {
    const connection = await sql.connect(appConfig.db);
    result = await connection.request().query(query);
    result = result?.recordset;
  } catch (connectionError) {
    error = connectionError.message;
    console.log("error from api", error);
  }
  return { result, error };
};
