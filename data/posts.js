import {posts} from '../config/mongoCollections.js';
import userData from './users.js';
import {ObjectId} from 'mongodb';
import validation from '../validation.js';

const exportedMethods = {
  async getAllPosts() {
    const postCollection = await posts();
    return await postCollection.find({}).toArray();
  },

  async getPostById(id) {
    id = validation.checkId(id, "Post ID");
    const postCollection = await posts();
    const post = await postCollection.findOne({_id: new ObjectId(id)});
    if (!post) throw 'Error: Post not found';

    return post;
  },

  async getPostsByTags(tags_lst) {
    tags_lst = validation.checkStringArray(tags_lst, 'Tags');
    
    const postCollection = await posts();
    return await postCollection.find({tags: { $in: tags_lst }}).toArray();
  },

  async addPost(title, userId, content, notation, key, instrument, tags) {
    title = validation.checkString(title, 'Title');
    content = validation.checkString(content, 'Content');
    userId = validation.checkId(posterId, 'Poster ID');

    notation = validation.checkString(notation, 'Notation');
    key = validation.checkString(key, 'Key');
    instrument = validation.checkString(instrument, 'Instrument');

    if (typeof tags === 'undefined' || tags === null) {
      tags = [];
    } else {
      tags = validation.checkStringArray(tags, 'Tags');
    }

    const user = await userData.getUserById(userId);
    if (!user) throw 'User for post not found';

    const newPost = {
      title: title,
      userId: userId,
      content: content,
      likes: [],
      dislikes: [],
      comments: [],
      notation: notation,
      key: key,
      instrument: instrument,
      tags: tags
    };

    const postCollection = await posts();
    const newInsertInformation = await postCollection.insertOne(newPost);
    const newId = newInsertInformation.insertedId;
    return await this.getPostById(newId.toString());
  },

  async removePost(id) {
    id = validation.checkId(id, "Post ID");

    const postCollection = await posts();
    const deletionInfo = await postCollection.findOneAndDelete({
      _id: new ObjectId(id)
    });

    if (!deletionInfo) throw `Could not delete post with id of ${id}`;
    return {...deletionInfo, deleted: true};
  },

  async updatePostPut(id, updatedPost) {
    id = validation.checkId(id, "Post ID");

    updatedPost.title = validation.checkString(updatedPost.title, 'title');
    updatedPost.tags = validation.checkStringArray(updatedPost.tags, 'Tags');
    updatedPost.notation = validation.checkString(updatedPost.notation, 'Notation');
    updatedPost.key = validation.checkString(updatedPost.key, 'Key');
    updatedPost.instrument = validation.checkString(updatedPost.instrument, 'Instrument');
    
    if (updatedPost.userId) {
      delete updatedPost.userId;
    }

    const postCollection = await posts();
    const updateInfo = await postCollection.findOneAndReplace(
      {_id: new ObjectId(id)},
      updatedPostData,
      {returnDocument: 'after'}
    );

    if (!updateInfo)
      throw `Error: Update failed! Could not update post with id ${id}`;
    return updateInfo;
  },

  async updatePostPatch(id, updatedPost) {
    const updatedPostData = {};
    if (updatedPost.userId) {
      throw 'Cannot update userId of post';
    }
    if (updatedPost.content) {
      throw 'Cannot update content of post';
    }

    let tags = [];
    if (updatedPost.tags) {
      tags = validation.checkStringArray(
        updatedPost.tags,
        'Tags'
      );
    }

    if (updatedPost.title) {
      updatedPostData.title = validation.checkString(
        updatedPost.title,
        'Title'
      );
    }

    if (updatedPost.notation) {
      updatedPostData.notation = validation.checkString(
        updatedPost.notation,
        'Notation'
      );
    }

    if (updatedPost.key) {
      updatedPostData.key = validation.checkString(
        updatedPost.key, 
        'Key');
    }

    if (updatedPost.instrument) {
      updatedPostData.instrument = validation.checkString(
        updatedPost.instrument,
        'Instrument'
      );
    }

    const postCollection = await posts();
    let newPost = await postCollection.findOneAndUpdate(
      {_id: new ObjectId(id)},
      {$set: updatedPostData, $addToSet: {tags: {$each: tags}}},
      {returnDocument: 'after'}
    );

    if (!newPost) throw `Could not update the post with id ${id}`;

    return newPost;
  },
  
  async renameTag(oldTag, newTag) {
    oldTag = validation.checkString(oldTag, 'Old Tag');
    newTag = validation.checkString(newTag, 'New Tag');
    if (oldTag === newTag) throw 'tags are the same';

    let findDocuments = {
      tags: oldTag
    };

    let firstUpdate = {
      $addToSet: {tags: newTag}
    };

    let secondUpdate = {
      $pull: {tags: oldTag}
    };
    const postCollection = await posts();
    let updateOne = await postCollection.updateMany(findDocuments, firstUpdate);
    if (updateOne.matchedCount === 0)
      throw `Could not find any posts with old tag: ${oldTag}`;
    let updateTwo = await postCollection.updateMany(
      findDocuments,
      secondUpdate
    );
    if (updateTwo.modifiedCount === 0) throw [500, 'Could not update tags'];
    return await this.getPostsByTag(newTag);
  }
};

export default exportedMethods;
