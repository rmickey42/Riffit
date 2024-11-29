import {comments} from '../config/mongoCollections.js';
import userData from './users.js';
import {ObjectId} from 'mongodb';
import validation from '../validation.js';

const exportedMethods = {
    async createComment(content, userId, postId) {
        content = validation.checkString(content, 'Content');
        userId = validation.checkId(userId, 'User ID');
        postId = validation.checkId(postId, 'Post ID');

        const comment = {
            content,
            userId: ObjectId(userId),
            postId: ObjectId(postId)
        };

        const commentCollection = await comments();
        const insertInfo = await commentCollection.insertOne(comment);

        if (insertInfo.insertedCount === 0) throw 'Could not add comment';

        return comment;
    },

    async getCommentById(id) {
        id = validation.checkId(id, 'Comment ID');

        const commentCollection = await comments();
        const comment = await commentCollection.findOne({ _id: ObjectId(id) });

        if (!comment) throw 'Comment not found';

        return comment;
    },

    async getAllComments() {
        const commentCollection = await comments();
        return await commentCollection.find({}).toArray();
    },

    async getCommentsByPostId(postId, sorting='newest') {
        postId = validation.checkId(postId, 'Post ID');

        const commentCollection = await comments();

        if (sorting === 'newest') {
            return await commentCollection.find({ postId: ObjectId(postId) }).sort({ _id: -1 }).toArray();
        }
        else if (sorting === 'oldest') {
            return await commentCollection.find({ postId: ObjectId(postId) }).sort({ _id: 1 }).toArray();
        }
        else {
            throw 'Invalid sorting method';
        }
    },

    async getCommentsByUserId(userId, sorting='newest') {
        userId = validation.checkId(userId, 'User ID');

        const commentCollection = await comments();
        
        if (sorting === 'newest') {
            return await commentCollection.find({ userId: ObjectId(userId) }).sort({ _id: -1 }).toArray();
        }
        else if (sorting === 'oldest') {
            return await commentCollection.find({ userId: ObjectId(userId) }).sort({ _id: 1 }).toArray();
        }
        else {
            throw 'Invalid sorting method';
        }
    },

    async removeComment(id) {
        id = validation.checkId(id, 'Comment ID');

        const commentCollection = await comments();
        const deletionInfo = await commentCollection.findOneAndDelete({
            _id: new ObjectId(id)
        });

        if (!deletionInfo) throw `Could not delete comment with id of ${id}`;
        return {...deletionInfo, deleted: true};
    },

    async updateComment(id, content) {
        id = validation.checkId(id, 'Comment ID');
        content = validation.checkString(content, 'Content');

        const commentCollection = await comments();
        const updateInfo = await commentCollection.findOneAndUpdate(
            {_id: new ObjectId(id)},
            {$set: {content: content}},
            {returnDocument: 'after'}
        );

        if (!updateInfo) throw `Could not update comment with id ${id}`;
        return updateInfo;
    }
};

export default exportedMethods;