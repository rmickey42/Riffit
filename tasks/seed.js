import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import { ObjectId } from "mongodb";
import users from "../data/users.js";
import posts from "../data/posts.js";
import comments from "../data/comments.js";

const db = await dbConnection();
await db.dropDatabase();

const user1 = await users.addUser("username", "Pa$$w0rd");
const updateUser1 = {
  bio: "something something idk bro",
  instruments: ["Piano", "Guitar   "],
  genres: ["Classic Rock   "],
};
const name = await users.updateUser(user1._id, updateUser1);
console.log(name);


const post1 = await posts.addPost(
  "First Post",
  user1._id,
  "somethingsomething",
  "somethingsomething",
  "G major",
  "guitar",
  ["Hard Rock"]
);

console.log(post1)
try {
  const updatePost1 = {
    tags: ["Something else    "],
    title: "Second Post Now",
  };
  const updatedpost1 = await posts.updatePost(post1._id, updatePost1);
  console.log(updatedpost1);
} catch (error) {
  console.log(error);
}

await closeConnection();
