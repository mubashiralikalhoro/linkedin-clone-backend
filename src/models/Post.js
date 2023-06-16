const Joi = require("joi");

const SELECTED_FIELDS = (userId) =>
  `(SELECT COUNT(id) FROM post_likes where postId=posts.id) as 'likes',
  (SELECT COUNT(id) FROM post_likes where postId=posts.id and userId = ${userId}) as 'isLiked',
  (SELECT COUNT(id) FROM post_comments where postId=posts.id) as 'comments',
  posts.*,users.fullname userFullname,users.image userImage,users.work userWork,users.username userUsername`;

const JOIN = "INNER JOIN users ON users.id=posts.userId";
// id,title,description,image,createdAt,userId
class Post {
  static validate(object) {
    const createSchema = Joi.object({
      title: Joi.string().allow("").max(500),
      description: Joi.string().allow("").max(100),
      //   image: Joi.string().max(255),
    });
    return createSchema.validate(object);
  }

  static QUERIES = {
    insert: () =>
      `INSERT INTO posts(uuid,title,description,image,createdAt,userId) VALUES (@uuid,@title,@description,@image,@createdAt,@userId)`,
    delete: (id) => `DELETE posts WHERE id=${id}`,
    update: () => {},
    get: (filter = {}, userId) => {
      let filterQuery = "";
      Object.keys(filter).forEach((key, index) => {
        filterQuery += `and posts.${key}='${filter[key]}'`;
      });
      return `SELECT ${SELECTED_FIELDS(userId)} FROM posts ${JOIN} ${filterQuery} ORDER BY posts.id DESC`;
    },
    like: (userId, postId) => `INSERT INTO post_likes(userId,postId) VALUES (${userId},${postId})`,
    unlike: (userId, postId) => `DELETE FROM post_likes WHERE userId=${userId} and postId=${postId}`,
    getCommentsByPostId: (postId) =>
      `SELECT post_comments.*,
      users.fullname userFullname,users.image userImage,users.work userWork,users.username userUsername 
      FROM post_comments INNER JOIN users ON users.id = post_comments.userId and post_comments.postId=${postId}
      ORDER BY Id DESC`,

    insertComment: () =>
      `INSERT INTO post_comments(uuid,text,createdAt,userId,postId) VALUES (@uuid,@text,@createdAt,@userId,@postId)`,

    getCommentByUuid: (uuid) =>
      `SELECT post_comments.*,
      users.fullname userFullname,users.image userImage,users.work userWork,users.username userUsername
      FROM post_comments INNER JOIN users ON users.id = post_comments.userId and post_comments.uuid='${uuid}'`,
  };
}

module.exports = Post;
