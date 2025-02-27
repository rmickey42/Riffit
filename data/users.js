import { users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import validation from "../validation.js";
import postData from "./posts.js";
import commentData from "./comments.js";

const BCRYPT_SALT = 11;

const DEFAULT_PFP = "/public/img/defaultPfp.jpeg";

const exportedMethods = {
  async getAllUsers() {
    const userCollection = await users();
    const userList = await userCollection.find({}).toArray();
    userList.forEach((user) => {
      user._id = user._id.toString();
    });

    return userList;
  },
  async getUserById(id, includePassword = false) {
    id = validation.checkId(id, "User Id");
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(id) });
    if (!user) throw "Error: User not found";
    if (!includePassword) delete user.password;
    user._id = user._id.toString();
    return user;
  },
  async getUserByUsername(username, includePassword = false) {
    username = validation.checkUsername(username, "Username");
    let col = await users();

    let res = await col.findOne(
      { username: username },
      { collation: { locale: "en", strength: 2 } }
    ); // case insensitive
    if (!res) return false;

    res["_id"] = res["_id"].toString();

    if (!includePassword) delete res.password;
    return res;
  },
  async signInUser(username, password) {
    username = validation.checkString(username, "Username");
    password = validation.checkString(password, "Password");
    let foundUsr = await this.getUserByUsername(username, true);
    if (foundUsr) {
      let pass_check = await bcrypt.compare(password, foundUsr.password);
      if (pass_check) {
        delete foundUsr.password;
        return foundUsr;
      } else throw "Either the username or password is invalid";
    } else {
      throw "Either the username or password is invalid";
    }
  },
  async addUser(username, password) {
    username = validation.checkUsername(username, "username");
    password = validation.checkPassword(password, "password");

    const userCollection = await users();

    let foundUsr = await userCollection.findOne({
      username: username,
    });
    if (foundUsr) throw `User with name ${username} already exists`;

    let newUser = {
      username,
      password: await bcrypt.hash(password, BCRYPT_SALT),
      bio: "",
      dailyStreak: 0,
      picture: DEFAULT_PFP,
      pictureType: "image/jpeg",
      instruments: [],
      genres: [],
      comments: [],
      posts: [],
      likedPosts: [],
      dislikedPosts: [],
      learnedPosts: [],
      favoritePosts: [],
    };

    const newInsertInformation = await userCollection.insertOne(newUser);
    if (!newInsertInformation.insertedId) throw "User could not be added";
    return await this.getUserById(newInsertInformation.insertedId.toString());
  },
  async removeUser(id) {
    id = validation.checkId(id, "User Id");
    const userCollection = await users();
    const deletionInfo = await userCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });
    if (!deletionInfo) throw `Error: Could not delete user with id of ${id}`;
    deletionInfo.posts.forEach((element) => {
      postData.removePost(element);
    });
    return { ...deletionInfo, deleted: true };
  },
  async getCommentsByUserId(id) {
    id = validation.checkId(id, "User Id");
    const user = await this.getUserById(id);
    for (let i = 0; i < user.comments.length; i++) {
      user.comments[i] = await commentData.getCommentById(user.comments[i]);
    }
    return user.comments;
  },
  async getLikedPostsByUserId(id) {
    id = validation.checkId(id, "User Id");
    const user = await this.getUserById(id);
    for (let i = 0; i < user.likedPosts.length; i++) {
      user.likedPosts[i] = await postData.getPostById(user.likedPosts[i]);
    }
    return user.likedPosts;
  },
  async getDislikedPostsByUserId(id) {
    id = validation.checkId(id, "User Id");
    const user = await this.getUserById(id);
    for (let i = 0; i < user.dislikedPosts.length; i++) {
      user.dislikedPosts[i] = await postData.getPostById(user.dislikedPosts[i]);
    }
    return user.dislikedPosts;
  },
  async getLearnedPostsByUserId(id) {
    id = validation.checkId(id, "User Id");
    const user = await this.getUserById(id);
    for (let i = 0; i < user.learnedPosts.length; i++) {
      user.learnedPosts[i] = await postData.getPostById(user.learnedPosts[i]);
    }
    return user.learnedPosts;
  },
  async getFavoritePostsByUserId(id) {
    id = validation.checkId(id, "User Id");
    const user = await this.getUserById(id);
    for (let i = 0; i < user.favoritePosts.length; i++) {
      user.favoritePosts[i] = await postData.getPostById(user.favoritePosts[i]);
    }
    return user.favoritePosts;
  },

  async updateUser(id, userInfo) {
    id = validation.checkId(id, "User Id");
    const updatedUserData = {};
    if (userInfo.username)
      updatedUserData.username = validation.checkString(
        userInfo.username,
        "username"
      );

    if (
      userInfo.currentPassword ||
      userInfo.newPassword ||
      userInfo.confirmPassword
    ) {
      if (!userInfo.newPassword || !userInfo.confirmPassword || !userInfo.currentPassword) {
        throw "All password fields must be provided.";
      }

      const currentUser = await this.getUserById(id, true);

      const isCurrentPasswordValid = await bcrypt.compare(
        //checks if user current password entered is correct
        userInfo.currentPassword,
        currentUser.password
      );

      if (!isCurrentPasswordValid) {
        throw "Current password is incorrect.";
      }

      if (userInfo.newPassword !== userInfo.confirmPassword) {
        throw "New password and confirmed password do not match.";
      }

      const isNewPasswordSameAsCurrent = await bcrypt.compare(
        //checks if user new password mathces current
        userInfo.newPassword,
        currentUser.password
      );
      if (isNewPasswordSameAsCurrent) {
        throw "New password must be different from the current password.";
      }
      const validatedPassword = validation.checkPassword(
        userInfo.newPassword,
        "New Password"
      );
      updatedUserData.password = await bcrypt.hash(
        validatedPassword,
        BCRYPT_SALT
      );
    }

    if (userInfo.bio !== undefined) {
      updatedUserData.bio = validation.checkStrType(userInfo.bio, "Bio");
    }
    if (userInfo.dailyStreak)
      updatedUserData.dailyStreak = validation.checkNum(
        userInfo.dailyStreak,
        "daily streak"
      );
    if (userInfo.picture) {
      if (userInfo.picture === "DELETE") {
        updatedUserData.picture = DEFAULT_PFP;
        updatedUserData.pictureType = "image/jpeg";
      } else {
        updatedUserData.picture = validation.checkProfilePicture(
          userInfo.picture
        );
        updatedUserData.pictureType = userInfo.picture.mimetype;
      }
    }

    if (userInfo.instruments)
      updatedUserData.instruments = validation.checkStringArray(
        userInfo.instruments,
        "instruments"
      );
    if (userInfo.genres)
      updatedUserData.genres = validation.checkStringArray(
        userInfo.genres,
        "genres"
      );
    if (userInfo.comments)
      updatedUserData.comments = validation.checkRefId(
        userInfo.comments,
        "comments"
      );
    if (userInfo.posts)
      updatedUserData.posts = validation.checkRefId(userInfo.posts, "posts");
    if (userInfo.likedPosts)
      updatedUserData.likedPosts = validation.checkRefId(
        userInfo.likedPosts,
        "liked posts"
      );
    if (userInfo.dislikedPosts)
      updatedUserData.dislikedPosts = validation.checkRefId(
        userInfo.dislikedPosts,
        "disliked posts"
      );
    if (userInfo.learnedPosts)
      updatedUserData.learnedPosts = validation.checkRefId(
        userInfo.learnedPosts,
        "learned posts"
      );
    if (userInfo.favoritePosts)
      updatedUserData.favoritePosts = validation.checkRefId(
        userInfo.favoritePosts,
        "favorite posts"
      );

    const userCollection = await users();
    const updateUser = await userCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatedUserData },
      { returnDocument: "after" }
    );
    if (!updateUser)
      throw `Error: Update failed, could not find a user with id of ${id}`;

    delete updateUser.password;
    updateUser._id = updateUser._id.toString();
    return updateUser;
  },

  //given a user id, the id that will be added/removed to the array, and the location of the altering
  //DO NOT USER IMMEDIATELY FOR COMMENTS, LIKES, AND DISLIKES. USE THE POSTRATING AND ADDCOMMENT METHODS INSTEAD
  async userArrayAlter(id, arrayId, param, add = true) {
    id = validation.checkId(id, "User Id");
    arrayId = validation.checkId(arrayId, "User Id");
    param = validation.checkString(param, "Type");

    const type = [
      "comments",
      "posts",
      "likedPosts",
      "dislikedPosts",
      "learnedPosts",
      "favoritePosts",
    ];
    if (!type.includes(param)) {
      throw `${param} is not a valid array reference for user`;
    }

    const userCollection = await users();
    let updateUser;
    if (add) {
      updateUser = await userCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $addToSet: { [param]: arrayId } },
        { returnDocument: "after" }
      );
    } else {
      updateUser = await userCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $pull: { [param]: arrayId } },
        { returnDocument: "after" }
      );
    }

    if (!updateUser)
      throw `Error: Update failed, could not find a ${type} with an id of ${id}`;

    updateUser._id = updateUser._id.toString();
    return updateUser;
  },
};

export default exportedMethods;
