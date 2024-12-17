import { comments } from "../config/mongoCollections.js";
import userData from "./users.js";
import { ObjectId } from "mongodb";
import validation from "../validation.js";
import  postData from "./posts.js";

const exportedMethods = {
  async getCommentById(id) {
    id = validation.checkId(id, "Comment ID");
    
    const commentCollection = await comments();
    const comment = await commentCollection.findOne({ _id: new ObjectId(id) });
    if (!comment) throw "Comment not found";
    comment._id = comment._id.toString();
    return comment;
  },

  async getCommentsByIds(ids) {
    if (!Array.isArray(ids)) throw "Must pass array of IDs";

    let ls = [];
    ids.forEach(async (id) => {
      id = validation.checkId(id, "Comment ID");
      ls.push(await this.getCommentById(id));
    });
    return ls;
  },

  async addComment(content, userId, postId) {
    content = validation.checkString(content, "Content");
    userId = validation.checkId(userId, "User ID");
    postId = validation.checkId(postId, "Post ID");
    const user = await userData.getUserById(userId);
    const post = await postData.getPostById(postId);
    const username = user.username;

    const commentCollection = await comments();

    const comment = {
      content,
      date: new Date(),
      username,
      userId,
      postId,
    };

    const newInsertInformation = await commentCollection.insertOne(comment);
    if (!newInsertInformation.insertedId) throw "Could not add comment";
    const commentId = newInsertInformation.insertedId.toString();

    await postData.postComment(postId, commentId)
    await userData.userArrayAlter(userId, commentId, "comments")  

    return await this.getCommentById(
      commentId
    );
  },

  async getAllComments() {
    const commentCollection = await comments();
    commentList = await commentCollection.find({}).toArray();

    commentList.forEach((comment) => {
      comment._id = comment._id.toString();
    });

    return commentList;
  },

  async getCommentsByPostId(postId, sorting = "newest") {
    postId = validation.checkId(postId, "Post ID");
    let commentList = [];
    const commentCollection = await comments();
    if (sorting === "newest") {
      commentList = await commentCollection
        .find({ postId: postId })
        .sort({ _id: -1 })
        .toArray();
    } else if (sorting === "oldest") {
      commentList = await commentCollection
        .find({ postId: postId })
        .sort({ _id: 1 })
        .toArray();
    } else {
      throw "Invalid sorting method";
    }

    commentList.forEach((comment) => {
      comment._id = comment._id.toString();
    });
    return commentList;
  },

  async removeComment(id) {
    id = validation.checkId(id, "Comment ID");

    const commentCollection = await comments();
    const deletionInfo = await commentCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!deletionInfo) throw `Could not delete comment with id of ${id}`;
    await userData.userArrayAlter(userId, newInsertInformation.insertedId, "comments", false)
    await postData.postComment(postId, newInsertInformation.insertedId, false)
    return { ...deletionInfo, deleted: true };
  },

  async updateComment(id, content) {
    id = validation.checkId(id, "Comment ID");
    content = validation.checkString(content, "Content");

    const commentCollection = await comments();
    const updateComment = await commentCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { content: content } },
      { returnDocument: "after" }
    );

    if (!updateComment) throw `Could not update comment with id ${id}`;
    updateComment._id = updateComment._id.toString();
    return updateComment;
  },
};

export default exportedMethods;
