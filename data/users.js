import { users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import validation from "../validation.js";

let exportedMethods = {
  async getAllUsers() {
    const userCollection = await users();
    const userList = await userCollection.find({}).toArray();
    return userList;
  },
  async getUserById(id) {
    id = validation.checkId(id);
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(id) });
    if (!user) throw "Error: User not found";
    return user;
  },
  async addUser(username, password) {
    username = validation.checkString(username, "First name");
    password = validation.checkString(password, "Last name");

    let newUser = {
      username,
      password,
      bio: "",
      dailyStreak: 0,
      picture: "",
      instruments: [],
      genres: [],
      comments: [],
      posts: [],
      likedPosts: [],
      dislikedPosts: [],
      learnedPosts: [],
      favoritePosts: [],
    };
    const userCollection = await users();
    const newInsertInformation = await userCollection.insertOne(newUser);
    if (!newInsertInformation.insertedId) throw "Insert failed!";
    return await this.getUserById(newInsertInformation.insertedId.toString());
  },
  async removeUser(id) {
    id = validation.checkId(id);
    const userCollection = await users();
    const deletionInfo = await userCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });
    if (!deletionInfo) throw `Error: Could not delete user with id of ${id}`;

    return { ...deletionInfo, deleted: true };
  },
 
  async updateUser(id, userInfo) {
    id = validation.checkId(id);
    if (userInfo.username)
      userInfo.username = validation.checkString(userInfo.username, "username");
    if (userInfo.password)
      userInfo.password = validation.checkString(userInfo.password, "password");
    if (userInfo.bio)
      userInfo.bio = validation.checkString(userInfo.password, "bio");
    if (userInfo.dailyStreak)
      userInfo.dailyStreak = validation.checkNum(
        userInfo.dailyStreak,
        "daily streak"
      );
    if (userInfo.picture)
      userInfo.picture = validation.checkString(userInfo.picture, "picture");
    if (userInfo.instruments)
      userInfo.instruments = validation.checkStringArray(
        userInfo.instruments,
        "instruments"
      );
    if (userInfo.genres)
      userInfo.genres = validation.checkStringArray(userInfo.genres, "genres");
    if (userInfo.comments)
      userInfo.comments = validation.checkRefId(userInfo.comments, "comments");
    if (userInfo.posts)
      userInfo.posts = validation.checkRefId(userInfo.posts, "posts");
    if (userInfo.likedPosts)
      userInfo.likedPosts = validation.checkRefId(
        userInfo.likedPosts,
        "liked posts"
      );
    if (userInfo.dislikedPosts)
      userInfo.dislikedPosts = validation.checkRefId(
        userInfo.dislikedPosts,
        "disliked posts"
      );
    if (userInfo.learnedPosts)
      userInfo.learnedPosts = validation.checkRefId(
        userInfo.learnedPosts,
        "learned posts"
      );
    if (userInfo.favoritePosts)
      userInfo.favoritePosts = validation.checkRefId(
        userInfo.favoritePosts,
        "favorite posts"
      );

    const userCollection = await users();
    const updateInfo = await userCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: userInfo },
      { returnDocument: "after" }
    );
    if (!updateInfo)
      throw `Error: Update failed, could not find a user with id of ${id}`;

    return updateInfo;
  },
};

export default exportedMethods;
