import { posts } from "../config/mongoCollections.js";
import userData from "./users.js";
import { ObjectId } from "mongodb";
import validation from "../validation.js";
import audioData from "./audio.js";

const exportedMethods = {
  async getAllPosts() {
    const postCollection = await posts();
    const postList = await postCollection.find({}).toArray();

    postList.forEach((post) => {
      post._id = post._id.toString();
    });

    return postList;
  },

  async getPostById(id) {
    id = validation.checkId(id, "Post ID");
    const postCollection = await posts();
    const post = await postCollection.findOne({ _id: new ObjectId(id) });
    if (!post) throw "Error: Post not found";
    post._id = post._id.toString();
    return post;
  },

  async getPostsByTags(tags_lst, sorting = "newest") {
    tags_lst = validation.checkStringArray(tags_lst, "Tags");

    const postCollection = await posts();
    let postList = [];
    if (sorting === "newest") {
      postlist = await postCollection
        .find({ tags: { $in: tags_lst } })
        .sort({ _id: -1 })
        .toArray();
    } else if (sorting === "oldest") {
      postList = await postCollection
        .find({ tags: { $in: tags_lst } })
        .sort({ _id: 1 })
        .toArray();
    } else if (sorting === "most_popular") {
      postList = await postCollection
        .find({ tags: { $in: tags_lst } })
        .sort({ rating: -1 })
        .toArray();
    } else if (sorting === "least_popular") {
      postList = await postCollection
        .find({ tags: { $in: tags_lst } })
        .sort({ rating: 1 })
        .toArray();
    } else {
      throw "Invalid sorting method";
    }

    postList.forEach((post) => {
      post._id = post._id.toString();
    });
    return postList;
  },

  async getPostsByUserId(userId, sorting = "newest") {
    userId = validation.checkId(userId, "User ID");
    let postList = [];
    const postCollection = await posts();
    if (sorting === "newest") {
      postList = await postCollection
        .find({ userId: userId })
        .sort({ _id: -1 })
        .toArray();
    } else if (sorting === "oldest") {
      postList = await postCollection
        .find({ userId: userId })
        .sort({ _id: 1 })
        .toArray();
    } else if (sorting === "most_popular") {
      postList = await postCollection
        .find({ userId: userId })
        .sort({ rating: -1 })
        .toArray();
    } else if (sorting === "least_popular") {
      postList = await postCollection
        .find({ userId: userId })
        .sort({ rating: 1 })
        .toArray();
    } else {
      throw "Invalid sorting method";
    }

    postList.forEach((post) => {
      post._id = post._id.toString();
    });
    return postList;
  },

  async addPost(title, userId, content, notation, key, instrument, tags) {
    title = validation.checkString(title, "Title");
    content = validation.checkString(content, "Content");
    userId = validation.checkId(userId, "User ID");
    notation = validation.checkString(notation, "Notation");
    key = validation.checkString(key, "Key");
    instrument = validation.checkString(instrument, "Instrument");

    if (typeof tags === "undefined" || tags === null) {
      tags = [];
    } else {
      tags = validation.checkStringArray(tags, "Tags");
    }

    const user = await userData.getUserById(userId);
    if (!user) throw "User for post not found";

    const newPost = {
      title: title,
      userId: userId,
      username: user.username,
      content: content,
      rating: 0,
      notation: notation,
      key: key,
      instrument: instrument,
      tags: tags,
      comments: [],
      date: new Date(),
    };

    const postCollection = await posts();
    const newInsertInformation = await postCollection.insertOne(newPost);
    if (!newInsertInformation.insertedId) throw "Could not add post";
    await userData.userArrayAlter(
      userId,
      newInsertInformation.insertedId.toString(),
      "posts"
    );
    return await this.getPostById(newInsertInformation.insertedId.toString());
  },

  async removePost(id) {
    id = validation.checkId(id, "Post ID");

    const post = await this.getPostById(id);
    // await audioData.removeAudio(post.content);

    const postCollection = await posts();
    const deletionInfo = await postCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!deletionInfo) throw `Could not delete post with id of ${id}`;
    await userData.userArrayAlter(deletionInfo.userId, id, "posts", false);
    return { ...deletionInfo, deleted: true };
  },

  async updatePost(id, updatedPost) {
    id = validation.checkId(id, "User Id");
    const updatedPostData = {};
    if (updatedPost.userId) {
      throw "Cannot update userId of post";
    }
    if (updatedPost.content) {
      throw "Cannot update content of post";
    }
    if (updatedPost.rating) {
      throw "Cannot directly update rating of post";
    }

    if (updatedPost.tags) {
      updatedPostData.tags = validation.checkStringArray(
        updatedPost.tags,
        "Tags"
      );
    }

    if (updatedPost.title) {
      updatedPostData.title = validation.checkString(
        updatedPost.title,
        "Title"
      );
    }

    if (updatedPost.notation) {
      updatedPostData.notation = validation.checkString(
        updatedPost.notation,
        "Notation"
      );
    }

    if (updatedPost.key) {
      updatedPostData.key = validation.checkString(updatedPost.key, "Key");
    }

    if (updatedPost.instrument) {
      updatedPostData.instrument = validation.checkString(
        updatedPost.instrument,
        "Instrument"
      );
    }

    const postCollection = await posts();
    const updatePost = await postCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatedPostData },
      { returnDocument: "after" }
    );

    if (!updatePost) throw `Could not update the post with id ${id}`;
    updatePost._id = updatePost._id.toString();
    return updatePost;
  },


  //DO NOT USE IMMEDIATELY, USE ADD COMMENT INSTEAD
  async postComment(id, arrayId, add=true) {
    id = validation.checkId(id, "Post Id");
    arrayId = validation.checkId(arrayId, "User Id");

    const postCollection = await posts();
    if(add){
      const updatePost = await postCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $addToSet: { comments: arrayId } },
        { returnDocument: "after" }
      );
    }else{
      const updatePost = await postCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $pull: { comments: arrayId } },
        { returnDocument: "after" }
      );
    }
    

    if (!updatePost)
      throw `Error: Update failed, could not find a comment with an id of ${id}`;

    updatePost._id = updatePost._id.toString();
    return updatePost;
  },

  async postRating(id, userId, like = true) {
    id = validation.checkId(id, "Post Id");
    userId = validation.checkId(userId, "User Id");
    let updatePost;
    const postCollection = await posts();
    if (like) {
      updatePost = await postCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $inc: { rating: 1 } },
        { returnDocument: "after" }
      );
      if (!updatePost)
        throw `Error: Update failed, could not find a comment with an id of ${id}`;
      await userData.userArrayAlter(userId, id, "likedPosts");
    } else {
      updatePost = await postCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $inc: { rating: -1 } },
        { returnDocument: "after" }
      );
      if (!updatePost)
        throw `Error: Update failed, could not find a comment with an id of ${id}`;
      await userData.userArrayAlter(userId, id, "likedPosts", false);
    }

    updatePost._id = updatePost._id.toString();
    return updatePost;
  },
};

export default exportedMethods;
