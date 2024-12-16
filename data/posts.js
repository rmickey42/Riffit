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

    const postCollection = await posts();
    let newPost = await postCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatedPostData, $addToSet: { tags: { $each: tags } } },
      { returnDocument: "after" }
    );

    if (!newPost) throw `Could not update the post with id ${id}`;

    return newPost;
  },

  async renameTag(oldTag, newTag) {
    oldTag = validation.checkString(oldTag, "Old Tag");
    newTag = validation.checkString(newTag, "New Tag");
    if (oldTag === newTag) throw "tags are the same";

    let findDocuments = {
      tags: oldTag,
    };

    let firstUpdate = {
      $addToSet: { tags: newTag },
    };

    let secondUpdate = {
      $pull: { tags: oldTag },
    };
    const postCollection = await posts();
    let updateOne = await postCollection.updateMany(findDocuments, firstUpdate);
    if (updateOne.matchedCount === 0)
      throw `Could not find any posts with old tag: ${oldTag}`;
    let updateTwo = await postCollection.updateMany(
      findDocuments,
      secondUpdate
    );
    if (updateTwo.modifiedCount === 0) throw [500, "Could not update tags"];
    return await this.getPostsByTag(newTag);
  },
};

export default exportedMethods;
