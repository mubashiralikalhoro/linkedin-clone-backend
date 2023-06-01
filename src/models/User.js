const Joi = require("joi");

const SELECTED_FIELDS =
  "id,username,fullname,email,phone,dateOfBirth,website,createdAt,image,coverImage,about,address";
class User {
  static validateUpdate = (object) => {
    const userSchema = Joi.object({
      fullname: Joi.string().max(255),
      username: Joi.string().max(255),
      phone: Joi.string().min(10).max(20),
      dateOfBirth: Joi.date(),
      website: Joi.string(),
      about: Joi.string().max(1000),
      address: Joi.string().max(255),
    });

    return userSchema.validate(object);
  };

  static validate = (object) => {
    const userSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      fullname: Joi.string().required(),
      username: Joi.string().required(),
      phone: Joi.string(),
      dateOfBirth: Joi.date(),
      website: Joi.string(),
    });

    return userSchema.validate(object);
  };

  static QUERIES = {
    insert: () =>
      `INSERT INTO users(username,fullname,password,email,createdAt) VALUES (@username,@fullname,@password,@email,@createdAt)`,
    delete: (id) => `DELETE users WHERE id=${id}`,
    update: {
      image: (id, url) => `UPDATE users SET image='${url}' WHERE id=${id}`,
      coverImage: (id, url) =>
        `UPDATE users SET coverImage='${url}' WHERE id=${id}`,

      columns: (id, columnNames = []) => {
        let updateQuery = "";
        columnNames.forEach((column, index) => {
          updateQuery += `${column}=@${column}`;
          if (index !== columnNames.length - 1) {
            updateQuery += ", ";
          }
        });
        return `UPDATE users SET ${updateQuery} WHERE id=${id}`;
      },
    },
    get: (filter = {}) => {
      let filterQuery = "";
      Object.keys(filter).forEach((key, index) => {
        filterQuery += `AND ${key}='${filter[key]}'`;
      });
      return `SELECT ${SELECTED_FIELDS} FROM users WHERE id IS NOT NULL ${filterQuery}`;
    },

    getWithPassword: (filter = {}) => {
      let filterQuery = "";
      Object.keys(filter).forEach((key, index) => {
        filterQuery += `AND ${key}='${filter[key]}'`;
      });
      return `SELECT * FROM users WHERE id IS NOT NULL ${filterQuery}`;
    },
  };
}

module.exports = User;
