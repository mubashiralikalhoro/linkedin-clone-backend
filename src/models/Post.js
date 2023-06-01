const Joi = require("joi");

const SELECTED_FIELDS =
  "posts.*,users.fullname userFullname,users.image userImage,users.work userWork,users.username userUsername";
const JOIN = "INNER JOIN users ON users.id=posts.userId";
// id,title,description,image,createdAt,userId
class Post {
  static validate(object) {
    const createSchema = Joi.object({
      title: Joi.string().max(500),
      description: Joi.string().max(100),
      //   image: Joi.string().max(255),
    });

    return createSchema.validate(object);
  }

  static QUERIES = {
    insert: () =>
      `INSERT INTO posts(uuid,title,description,image,createdAt,userId) VALUES (@uuid,@title,@description,@image,@createdAt,@userId)`,
    delete: (id) => `DELETE posts WHERE id=${id}`,
    update: () => {},
    get: (filter = {}) => {
      let filterQuery = "";
      Object.keys(filter).forEach((key, index) => {
        filterQuery += `and posts.${key}='${filter[key]}'`;
      });
      return `SELECT ${SELECTED_FIELDS} FROM posts ${JOIN} ${filterQuery} ORDER BY posts.id DESC`;
    },
  };
}

module.exports = Post;
