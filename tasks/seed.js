import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import { userData, postData, commentData, audioData } from "../data/index.js";
import fs from 'fs';
import path from 'path';

const main = async () => {
  const db = await dbConnection();
  await db.dropDatabase();

  // Create users
  const user1 = await userData.addUser("johnDoe", "Password123!");
  const user2 = await userData.addUser("janeDoe", "Password123!");

  // add audio
  const audioPath = path.resolve('public/riff1.mp3');
  const audioBuffer = fs.readFileSync(audioPath);
  const audioId1 = await audioData.addAudioDirect(audioBuffer);

  const blank_tab = "e|---------------------------------------------------------------|\nB|---------------------------------------------------------------|\nG|---------------------------------------------------------------|\nD|---------------------------------------------------------------|\nA|---------------------------------------------------------------|\nE|---------------------------------------------------------------|";

  // Create posts
  const post1 = await postData.addPost(
    "First Riff",
    user1._id,
    audioId1,
    blank_tab,
    "A minor",
    "Guitar",
    ["rock", "blues"]
  );

  // Create comments
  const comment1 = await commentData.addComment(
    "Great post!",
    user2._id,
    post1._id
  );

  console.log("Database seeded successfully");
  await closeConnection();
};

main().catch(console.error);