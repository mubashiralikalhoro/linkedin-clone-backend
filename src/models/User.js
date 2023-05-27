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

  // queries
  getInsertQuery() {
    this.createdAt = new Date().toISOString();
    return `INSERT INTO users(username,fullname,password,email,createdAt)
     VALUES ('${this.username}','${this.fullname}','${this.password}','${this.email}','${this.createdAt}')`;
  }

  getUpdateQuery() {
    return `UPDATE users SET username='${this.username}',
    fullname='${this.fullname}',password='${this.password}',
    email='${this.email}',phone='${this.phone}',dateOfBirth='${this.dateOfBirth}',
    website='${this.website}',createdAt='${this.createdAt}' WHERE id=${this.id}`;
  }

  getSelectQuery() {
    return `SELECT id,username,fullname,email,phone,dateOfBirth,website,createdAt FROM users WHERE id=${this.id}`;
  }

  getSelectByEmailQuery() {
    return `SELECT id,username,fullname,email,phone,dateOfBirth,website,createdAt FROM users WHERE email='${this.email}'`;
  }

  // static methods
  static getSelectAllQuery() {
    return `SELECT id,username,fullname,email,phone,dateOfBirth,website,createdAt FROM users`;
  }

  static getSelectQuery(id) {
    return `SELECT id,username,fullname,email,phone,dateOfBirth,website,createdAt FROM users WHERE id=${id}`;
  }

  static getUserFromRequestBody = (body) => {
    const { email, password, fullname, username, phone, dateOfBirth, website } =
      body;
    return new User(
      null,
      username,
      fullname,
      password,
      email,
      phone,
      dateOfBirth,
      website,
      null
    );
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
}

module.exports = User;
