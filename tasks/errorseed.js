import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import users from "../data/users.js";
import posts from "../data/posts.js";
import comments from "../data/comments.js";

const db = await dbConnection();
await db.dropDatabase();

let u = "username";
let p = "Pa$$w0rd";

try {
  const name = await users.addUser();
} catch (error) {
  console.log(error);
}

try {
  const name = await users.addUser("asdffds");
} catch (error) {
  console.log(error);
}

try {
  const name = await users.addUser("askjdhflkajsflkajdsf", "askjdfhalsdfjk");
} catch (error) {
  console.log(error);
}

try {
  const name = await users.addUser(u, "asdfasfd");
} catch (error) {
  console.log(error);
}

const valid = await users.addUser(u, p);
console.log(valid);

// checking dupes
try {
  const name = await users.addUser("USERNAME", p);
} catch (error) {
  console.log(error);
}

try {
  const name = await users.addUser("U$SERNAME", p);
} catch (error) {
  console.log(error);
}

try {
  const name = await users.addUser("U SERNAME", p);
} catch (error) {
  console.log(error);
}

try {
  const name = await users.updateUser();
} catch (error) {
  console.log(error);
}

try {
  let update = {
    

  };
  const name = await users.updateUser(update);
} catch (error) {
  console.log(error);
}

await closeConnection();
