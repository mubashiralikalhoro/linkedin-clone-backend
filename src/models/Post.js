const Joi = require("joi");

const SELECTED_FIELDS =
  "posts.*,users.fullname userFullname,users.image userImage";
const JOIN = "INNER JOIN users ON users.id=posts.userId";
// id,title,description,image,createdAt,userId
class Post {
  constructor(uuid, title, description, image, createdAt, userId) {
    this.uuid = uuid;
    this.title = title;
    this.description = description;
    this.image = image;
    this.createdAt = createdAt;
    this.userId = userId;
  }

  static validate(object) {
    const createSchema = Joi.object({
      title: Joi.string().max(500),
      description: Joi.string().max(100),
      //   image: Joi.string().max(255),
    });

    return createSchema.validate(object);
  }

  getInsertQuery() {
    return `INSERT INTO posts(uuid,title,description,image,createdAt,userId)
    VALUES ('${this.uuid}','${this.title}','${this.description}','${this.image}','${this.createdAt}',${this.userId})`;
  }

  getSelectByUuidQuery() {
    return `SELECT ${SELECTED_FIELDS} FROM posts ${JOIN} and uuid='${this.uuid}'`;
  }

  static getSelectQuery(id) {
    return `SELECT ${SELECTED_FIELDS} FROM posts ${JOIN} and posts.id=${id} `;
  }

  static getSelectByUserQuery(userId) {
    return `SELECT ${SELECTED_FIELDS} FROM posts ${JOIN} and posts.userId='${userId}'`;
  }

  static getSelectAllQuery() {
    return `SELECT ${SELECTED_FIELDS} FROM posts ${JOIN}`;
  }

  static getDeleteByIdQuery(id) {
    return `DELETE posts WHERE id=${id}`;
  }
}

module.exports = Post;
