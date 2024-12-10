import { users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import validation from "../validation.js";

const BCRYPT_SALT = 16

const exportedMethods = {
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
  async getUserByUsername(username) {
    let userTrim = validation.checkUserName(username, "Username");
    let col = await users();

    let res = await col.findOne({"username" : userTrim,}, {collation: {locale: 'en', strength: 2}}); // case insensitive
    if(!res) return false;

    res["_id"] = res["_id"].toString();

    return res

  },
  async signInUser(username, password) {
    let userTrim = validation.checkUserName(username, "Username");
    let passTrim = validation.checkPassword(password, "Password");
  
    let foundUsr = await getUserByUsername(userTrim)
    
  
    if(foundUsr){
      let pass_check = await bcrypt.compare(passTrim,foundUsr.password)
  
      if(pass_check){
        delete(foundUsr._id)
        delete(foundUsr.password)
        return foundUsr
      } else throw "Either the username or password are invalid"
  
    } else {
      throw "Either the username or password are invalid"
    }
  },
  async addUser(username, password) {
    username = validation.checkString(username, "username");
    password = validation.checkString(password, "password");

    let newUser = {
      username,
      password: await bcrypt.hash(password, BCRYPT_SALT),
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
  async getCommentsByUserId(id) {
    id = validation.checkId(id);
    const user = await this.getUserById(id);
    for (let i = 0; i < user.comments.length; i++) {
      user.comments[i] = await this.getCommentById(user.comments[i]);
    }
    return user.comments;
  },
  async getLikedPostsByUserId(id) {
    id = validation.checkId(id);
    const user = await this.getUserById(id);
    for (let i = 0; i < user.likedPosts.length; i++) {
      user.likedPosts[i] = await this.getPostById(user.likedPosts[i]);
    }
    return user.likedPosts;
  },
  async getDislikedPostsByUserId(id) {
    id = validation.checkId(id);
    const user = await this.getUserById(id);
    for (let i = 0; i < user.dislikedPosts.length; i++) {
      user.dislikedPosts[i] = await this.getPostById(user.dislikedPosts[i]);
    }
    return user.dislikedPosts;
  },
  async getLearnedPostsByUserId(id) {
    id = validation.checkId(id);
    const user = await this.getUserById(id);
    for (let i = 0; i < user.learnedPosts.length; i++) {
      user.learnedPosts[i] = await this.getPostById(user.learnedPosts[i]);
    }
    return user.learnedPosts;
  },
  async getFavoritePostsByUserId(id) {
    id = validation.checkId(id);
    const user = await this.getUserById(id);
    for (let i = 0; i < user.favoritePosts.length; i++) {
      user.favoritePosts[i] = await this.getPostById(user.favoritePosts[i]);
    }
    return user.favoritePosts;
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
