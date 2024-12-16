import { posts } from "../config/mongoCollections.js";
import userData from "./users.js";
import { ObjectId } from "mongodb";
import validation from "../validation.js";
import audioData from "./audio.js";

const exportedMethods = {
  async getAllPosts() {
    const postCollection = await posts();
    return await postCollection.find({}).toArray();
  },

  async getPostById(id) {
    id = validation.checkId(id, "Post ID");
    const postCollection = await posts();
    const post = await postCollection.findOne({ _id: new ObjectId(id) });
    if (!post) throw "Error: Post not found";

    return post;
  },

  async getPostsByTags(tags_lst, sorting = "newest") {
    tags_lst = validation.checkStringArray(tags_lst, "Tags");

    const postCollection = await posts();

    if (sorting === "newest") {
      return await postCollection
        .find({ tags: { $in: tags_lst } })
        .sort({ _id: -1 })
        .toArray();
    } else if (sorting === "oldest") {
      return await postCollection
        .find({ tags: { $in: tags_lst } })
        .sort({ _id: 1 })
        .toArray();
    } else if (sorting === "most_popular") {
      return await postCollection
        .find({ tags: { $in: tags_lst } })
        .sort({ rating: -1 })
        .toArray();
    } else if (sorting === "least_popular") {
      return await postCollection
        .find({ tags: { $in: tags_lst } })
        .sort({ rating: 1 })
        .toArray();
    } else {
      throw "Invalid sorting method";
    }
  },

  async getPostsByUserId(userId, sorting = "newest") {
    userId = validation.checkId(userId, "User ID");

    const postCollection = await posts();
    if (sorting === "newest") {
      return await postCollection
        .find({ userId: userId })
        .sort({ _id: -1 })
        .toArray();
    } else if (sorting === "oldest") {
      return await postCollection
        .find({ userId: userId })
        .sort({ _id: 1 })
        .toArray();
    } else if (sorting === "most_popular") {
      return await postCollection
        .find({ userId: userId })
        .sort({ rating: -1 })
        .toArray();
    } else if (sorting === "least_popular") {
      return await postCollection
        .find({ userId: userId })
        .sort({ rating: 1 })
        .toArray();
    } else {
      throw "Invalid sorting method";
    }
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
      date: new Date(),
    };

    const postCollection = await posts();
    const newInsertInformation = await postCollection.insertOne(newPost);
    const newId = newInsertInformation.insertedId;
    return await this.getPostById(newId.toString());
  },

  async removePost(id) {
    id = validation.checkId(id, "Post ID");

    const post = await this.getPostById(id);
    await audioData.removeAudio(post.content);

    const postCollection = await posts();
    const deletionInfo = await postCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!deletionInfo) throw `Could not delete post with id of ${id}`;
    return { ...deletionInfo, deleted: true };
  },

  async updatePost(id, updatedPost) {
    id = validation.checkId(id);
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

    let tags = [];
    if (updatedPost.tags) {
      tags = validation.checkStringArray(updatedPost.tags, "Tags");
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

    console.log(updatedPostData);
    const postCollection = await posts();
    let newPost = await postCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatedPostData, $addToSet: { tags: { $each: tags } } },
      { returnDocument: "after" }
    );

    if (!newPost) throw `Could not update the post with id ${id}`;

    return newPost;
  },

  //DO NOT USE IMMEDIATELY, USE ADD COMMENT INSTEAD
  async postComment(id, arrayId, add = true) {
    id = validation.checkId(id, "Post Id");
    arrayId = validation.checkId(arrayId, "User Id");

    const postCollection = await posts();
    if (add) {
      const updatePost = await postCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $addToSet: { comments: arrayId } },
        { returnDocument: "after" }
      );
    } else {
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

  async postLike(id, userId, like = true) {
    id = validation.checkId(id, "Post Id");
    userId = validation.checkId(userId, "User Id");
    let updatePost;
    const postCollection = await posts();
    const likedList = (await userData.getUserById(userId)).likedPosts;
    if (like) {
      if (!likedList || !likedList.includes(id)) {
        updatePost = await postCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $inc: { rating: 1 } },
          { returnDocument: "after" }
        );
        if (!updatePost)
          throw `Error: Update failed, could not find a post with an id of ${id}`;
        await userData.userArrayAlter(userId, id, "likedPosts");
      }else{ throw `Already liked`}
    } else {
      if (likedList.includes(id)) {
        updatePost = await postCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $inc: { rating: -1 } },
          { returnDocument: "after" }
        );
        if (!updatePost)
          throw `Error: Update failed, could not find a post with an id of ${id}`;
        await userData.userArrayAlter(userId, id, "likedPosts", false);
      }else{ throw `No like to reverse`}
    }

    updatePost._id = updatePost._id.toString();
    return updatePost;
  },

  async postDislike(id, userId, dislike = true) {
    id = validation.checkId(id, "Post Id");
    userId = validation.checkId(userId, "User Id");
    let updatePost;
    const postCollection = await posts();
    const dislikedList = (await userData.getUserById(userId)).dislikedPosts;
    if (dislike) {
      if (!dislikedList || !dislikedList.includes(id)) {
        updatePost = await postCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $inc: { rating: -1 } },
          { returnDocument: "after" }
        );
        if (!updatePost)
          throw `Error: Update failed, could not find a post with an id of ${id}`;
        await userData.userArrayAlter(userId, id, "dislikedPosts");
      }else{ throw `Already disliked`}
    } else {
      if (dislikedList.includes(id)) {
        updatePost = await postCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $inc: { rating: 1 } },
          { returnDocument: "after" }
        );
        if (!updatePost)
          throw `Error: Update failed, could not find a post with an id of ${id}`;
        await userData.userArrayAlter(userId, id, "dislikedPosts", false);
      }else{ throw `No dislike to reverse`}
    }

    updatePost._id = updatePost._id.toString();
    return updatePost;
  },

  async postFavorite(id, userId, favorite = true) {
    id = validation.checkId(id, "Post Id");
    userId = validation.checkId(userId, "User Id");
    let updatePost;
    const postCollection = await posts();
    const favoritedList = (await userData.getUserById(userId)).favoritePosts;

    if (favorite) {
      if (!favoritedList || !favoritedList.includes(id)) {
        updatePost = await postCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $inc: { favorites: 1 } },
          { returnDocument: "after" }
        );
        if (!updatePost)
          throw `Error: Update failed, could not find a post with an id of ${id}`;
        await userData.userArrayAlter(userId, id, "favoritePosts");
      }else{ throw 'Already favorited'}
    } else {
      if (favoritedList.includes(id)) {
        updatePost = await postCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $inc: { favorites: -1 } },
          { returnDocument: "after" }
        );
        if (!updatePost)
          throw `Error: Update failed, could not find a post with an id of ${id}`;
        await userData.userArrayAlter(userId, id, "favoritePosts", false);
      }else{ throw 'No favorite to reverse'}
    }

    updatePost._id = updatePost._id.toString();
    return updatePost;
  },
};

export default exportedMethods;
