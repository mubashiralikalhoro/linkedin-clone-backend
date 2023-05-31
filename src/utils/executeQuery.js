const sql = require("mssql");
const appConfig = require("../config/config");

module.exports = async (db, query) => {
  let result = null;
  let error = null;
  try {
    result = await db.query(query);
    result = result?.recordset;
  } catch (connectionError) {
    error = connectionError.message;
    console.log("DB ERROR :", error, "\nQUERY :", query);
  }
  return { result, error };
};
