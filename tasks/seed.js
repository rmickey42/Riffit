import { dbConnection, closeConnection } from "../config/mongoConnection.js";
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

const updatePost1 = {
  tags: ["Something else    "],
  title: "Second Post Now",
};
const updatedpost1 = await posts.updatePost(post1._id, updatePost1);
const post1a = await posts.postLike(post1._id, user1._id);

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


const post2 = await posts.addPost(
  "Another Post",
  user1._id,
  "somethingelse",
  "somethingelse",
  "G minor",
  "bass",
  ["Soft Rock"]
);

const post3 = await posts.addPost(
  "Yet Another Post",
  user1._id,
  "somethingsomething",
  "somethingsomething",
  "G major",
  "guitar",
  ["Hard Rock"]
);

const post6 = await posts.addPost(
  "User2's First Post",
  user2._id,
  "Description for user2's post",
  "tabsForUser2",
  "A minor",
  "violin",
  ["Classical", "Violin"]
);

const post5 = await posts.addPost(
  "User3's First Post",
  user3._id,
  "Description for user3's post",
  "tabsForUser3",
  "B major",
  "saxophone",
  ["Jazz", "Saxophone"]
);

const post4 = await posts.addPost(
  "User4's First Post",
  user4._id,
  "Description for user4's post",
  "tabsForUser4",
  "E minor",
  "flute",
  ["Pop", "Flute"]
);

await posts.postLike(post4._id, user3._id);
const post4c = await posts.postLike(post4._id, user2._id);


const post4a = await posts.postDislike(post4._id, user1._id);
const updatePost2 = {
  tags: ["Something else"],
};

const post4b = await posts.updatePost(post4._id, updatePost2);

await posts.postLike(post3._id, user1._id);

await posts.postFavorite(post2._id, user4._id);

await comments.addComment("nice", user2._id, post3._id);
const comment1 = await comments.addComment(
  "omg wow so nice",
  user3._id,
  post3._id
);
await comments.addComment("cool", user4._id, post3._id);
const comment2 = await comments.addComment("thanks guys", user1._id, post3._id);
const comment3 = await comments.updateComment(comment1._id, "nevermind");

await comments.removeComment(comment2._id)



await closeConnection();
