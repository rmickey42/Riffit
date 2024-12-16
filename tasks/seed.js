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
// console.log(name);


const post1 = await posts.addPost(
  "First Post",
  user1._id,
  "somethingsomething",
  "somethingsomething",
  "G major",
  "guitar",
  ["Hard Rock"]
);

// console.log(post1)
try {
  const updatePost1 = {
    tags: ["Something else    "],
    title: "Second Post Now",
  };
  const updatedpost1 = await posts.updatePost(post1._id, updatePost1);
//   console.log(updatedpost1);
} catch (error) {
  console.log(error);
}

// const updatething = await users.userArrayAdd(user1._id, post1._id, "posts")

// console.log(updatething)


// const user1a = await users.getUserById(user1._id)
const post1a = await posts.postRating(post1._id, user1._id)
// console.log(await users.getUserById(user1._id))
// console.log(post1a)

const post1b = await posts.postRating(post1._id, user1._id, false)
// console.log(await users.getUserById(user1._id))
// console.log(post1b)

// const post1c = await posts.removePost(post1._id)
// console.log(await users.getUserById(user1._id))


const user2 = await users.addUser("anotherGuy", "Pa$$w0rd");
const updateUser2 = {
  bio: "damn im really bad at making bios",
  instruments: ["Guitar"],
  genres: ["Jazz", "Funk"],
};
await users.updateUser(user2._id, updateUser2);
// console.log(name);

const user3 = await users.addUser("OneMore", "samePa$$w0rd");
const updateUser3 = {
  bio: "again",
  instruments: ["Bass"],
  genres: ["Metal"],
};
await users.updateUser(user3._id, updateUser3);

const user4 = await users.addUser("ILied", "samePa$$w0rd");
const updateUser4 = {
  bio: "so many users",
  instruments: ["Ukelele", "12-String guitar"],
  genres: ["Country"],
};
await users.updateUser(user4._id, updateUser4);

// console.log(await users.getAllUsers())

console.log(await users.getUserByUsername("oneMORE"))
await users.removeUser(user4._id)
console.log(await users.getAllUsers())

await closeConnection();
