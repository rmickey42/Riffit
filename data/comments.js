import { comments } from "../config/mongoCollections.js";
import userData from "./users.js";
import { ObjectId } from "mongodb";
import validation from "../validation.js";

const exportedMethods = {
  async addComment(content, userId, postId) {
    content = validation.checkString(content, "Content");
    userId = validation.checkId(userId, "User ID");
    postId = validation.checkId(postId, "Post ID");

    const commentCollection = await comments();

    const comment = {
      content,
      date: new Date(),
      userId,
      postId,
    };

    const newInsertInformation = await commentCollection.insertOne(comment);
    if (!newInsertInformation.insertedId) throw "Could not add comment";
    return await this.getCommentById(
      newInsertInformation.insertedId.toString()
    );
  },

  async getCommentById(id) {
    id = validation.checkId(id, "Comment ID");
    const commentCollection = await comments();
    const comment = await commentCollection.findOne({ _id: ObjectId(id) });
    if (!comment) throw "Comment not found";
    comment._id = comment._id.toString();
    return comment;
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
        .find({ postId: ObjectId(postId) })
        .sort({ _id: -1 })
        .toArray();
    } else if (sorting === "oldest") {
      commentList = await commentCollection
        .find({ postId: ObjectId(postId) })
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
