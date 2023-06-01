const sql = require("mssql");
const appConfig = require("../config/config");

module.exports.executeQuery = async (db, query) => {
  let result = null;
  let error = null;
  try {
    result = await db.query(query);
    result = result?.recordset;
    console.log("QUERY EXECUTED :", query);
  } catch (connectionError) {
    error = connectionError.message;
    console.log("DB ERROR :", error, "\nQUERY :", query);
  }
  return { result, error };
};

module.exports.executeQueryWithData = async (db, query, data = {}) => {
  let result = null;
  let error = null;
  try {
    const request = new sql.Request(db);
    // extracting data
    Object.keys(data).forEach((key) => {
      request.input(key, data?.[key]);
    });

    result = await request.query(query);
    result = result?.recordset;
    console.log("QUERY EXECUTED :", query);
  } catch (connectionError) {
    error = connectionError.message;
    console.log("DB ERROR :", error, "\nQUERY :", query);
  }
  return { result, error };
};
