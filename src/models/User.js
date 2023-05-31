const Joi = require("joi");

class User {
  constructor(
    id,
    username,
    fullname,
    password,
    email,
    phone,
    dateOfBirth,
    website,
    createdAt
  ) {
    this.id = id;
    this.username = username;
    this.fullname = fullname;
    this.password = password;
    this.email = email;
    this.phone = phone;
    this.dateOfBirth = dateOfBirth;
    this.website = website;
    this.createdAt = createdAt;
  }

  static validateUpdate = (object) => {
    const userSchema = Joi.object({
      fullname: Joi.string(),
      username: Joi.string(),
      phone: Joi.string().min(10).max(20),
      dateOfBirth: Joi.date(),
      website: Joi.string(),
      about: Joi.string(),
      address: Joi.string(),
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

  static PUBLIC_FIELDS =
    "id,username,fullname,email,phone,dateOfBirth,website,createdAt,image,coverImage,about,address";

  // queries
  getInsertQuery() {
    return `INSERT INTO users(username,fullname,password,email,createdAt)
     VALUES ('${this.username}','${this.fullname}','${this.password}','${this.email}','${this.createdAt}')`;
  }

  getSelectQuery() {
    return `SELECT ${this.PUBLIC_FIELDS} FROM users WHERE id=${this.id}`;
  }

  getSelectByEmailQuery() {
    return `SELECT ${this.PUBLIC_FIELDS} FROM users WHERE email='${this.email}'`;
  }

  static getUpdateImageQuery(id, url) {
    return `UPDATE users SET image='${url}' WHERE id=${id}`;
  }

  static getUpdateCoverImageQuery(id, url) {
    return `UPDATE users SET coverImage='${url}' WHERE id=${id}`;
  }

  static getSelectAllQuery() {
    return `SELECT ${this.PUBLIC_FIELDS} FROM users`;
  }

  static getSelectQuery(id) {
    return `SELECT ${this.PUBLIC_FIELDS} FROM users WHERE id=${id}`;
  }

  static getUserFromRequestBody = (body) => {
    const {
      email,
      password,
      fullname,
      username,
      phone,
      dateOfBirth,
      website,
      createdAt,
    } = body;
    return new User(
      null,
      username,
      fullname,
      password,
      email,
      phone,
      dateOfBirth,
      website,
      createdAt
    );
  };

  static getSelectUserByEmailQuery(email) {
    return `SELECT ${this.PUBLIC_FIELDS} FROM users WHERE email='${email}'`;
  }

  static getSelectUserByEmailQueryForLogin(email) {
    return `SELECT * FROM users WHERE email='${email}'`;
  }

  static getSelectUserByEmailAndPasswordQuery(email, password) {
    return `SELECT ${this.PUBLIC_FIELDS} FROM users WHERE email='${email}' AND password='${password}'`;
  }

  static getUpdateQuery(id, body) {
    const keys = Object.keys(body);
    const values = Object.values(body);
    let updateQuery = "";
    keys.forEach((key, index) => {
      updateQuery += `${key}='${values[index]}'`;
      if (index !== keys.length - 1) {
        updateQuery += ", ";
      }
    });

    console.log("query ", `UPDATE users SET ${updateQuery} WHERE id=${id}`);

    return `UPDATE users SET ${updateQuery} WHERE id=${id}`;
  }
}

module.exports = User;
