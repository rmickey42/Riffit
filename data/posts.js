import { posts } from "../config/mongoCollections.js";
import userData from "./users.js";
import { ObjectId } from "mongodb";
import validation from "../validation.js";
import commentData from "./comments.js";
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

  async getPostsByTags(tags_lst, page, sorting = "newest") {
    tags_lst = validation.checkStringArray(tags_lst, "Tags");
    page = validation.checkNum(page, "page");

    const postCollection = await posts();
    let postList = [];
    if (sorting === "newest") {
      postList = await postCollection
        .find({ tags: { $in: tags_lst } })
        .sort({ _id: -1 })
        .skip(page * 10)
        .limit(10)
        .toArray();
    } else if (sorting === "oldest") {
      postList = await postCollection
        .find({ tags: { $in: tags_lst } })
        .sort({ _id: 1 })
        .skip(page * 10)
        .limit(10)
        .toArray();
    } else if (sorting === "most_popular") {
      postList = await postCollection
        .find({ tags: { $in: tags_lst } })
        .sort({ rating: -1 })
        .skip(page * 10)
        .limit(10)
        .toArray();
    } else if (sorting === "least_popular") {
      postList = await postCollection
        .find({ tags: { $in: tags_lst } })
        .sort({ rating: 1 })
        .skip(page * 10)
        .limit(10)
        .toArray();
    } else {
      throw "Invalid sorting method";
    }

    if (postList.length === 0) {
      throw `Page number ${page} is invalid`;
    }

    postList.forEach((post) => {
      post._id = post._id.toString();
    });
    return postList;
  },

  async getPostsByUserId(userId, page, sorting = "newest") {
    userId = validation.checkId(userId, "User ID");
    page = validation.checkNum(page, "page");
    let postList = [];
    const postCollection = await posts();
    if (sorting === "newest") {
      postList = await postCollection
        .find({ userId: userId })
        .sort({ _id: -1 })
        .skip(page * 10)
        .limit(10)
        .toArray();
    } else if (sorting === "oldest") {
      postList = await postCollection
        .find({ userId: userId })
        .sort({ _id: 1 })
        .skip(page * 10)
        .limit(10)
        .toArray();
    } else if (sorting === "most_popular") {
      postList = await postCollection
        .find({ userId: userId })
        .sort({ rating: -1 })
        .skip(page * 10)
        .limit(10)
        .toArray();
    } else if (sorting === "least_popular") {
      postList = await postCollection
        .find({ userId: userId })
        .sort({ rating: 1 })
        .skip(page * 10)
        .limit(10)
        .toArray();
    } else {
      throw "Invalid sorting method";
    }

    if (postList.length() === 0) {
      throw `Page number ${page} is invalid`;
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
      favorites: 0,
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
    await audioData.removeAudio(post.content);

    const postCollection = await posts();
    const deletionInfo = await postCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!deletionInfo) throw `Could not delete post with id of ${id}`;
    await userData.userArrayAlter(deletionInfo.userId, id, "posts", false);
    deletionInfo.comments.forEach((element) => {
      commentData.removeComment(element);
    });
    await commentData.removeComment;
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
  async postComment(id, arrayId, add = true) {
    id = validation.checkId(id, "Post Id");
    arrayId = validation.checkId(arrayId, "User Id");

    const postCollection = await posts();
    let updatePost;
    if (add) {
      updatePost = await postCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $addToSet: { comments: arrayId } },
        { returnDocument: "after" }
      );
    } else {
      updatePost = await postCollection.findOneAndUpdate(
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
