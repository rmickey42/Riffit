import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import users from "../data/users.js";
import posts from "../data/posts.js";
import comments from "../data/comments.js";

const db = await dbConnection();
await db.dropDatabase();

let u = "username";
let p = "Pa$$w0rd";

const valid = await users.addUser(u, p);
console.log(valid);

try {
  let update = {
    bio: "something something idk bro",
    instruments: ["Piano", "Guitar   "],
    genres: ["Classic Rock   "],
  };
  const name = await users.updateUser(valid._id, update);
  console.log(name);
} catch (error) {
  console.log(error);
}

await closeConnection();
