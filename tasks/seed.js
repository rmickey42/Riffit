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
  const user3 = await userData.addUser("trumpetgod", "iloveTrumpet42?");
  const user4 = await userData.addUser("bassmaster", "BassGuitar321!");

  // add audio
  const audioId1 = await audioData.addAudioDirect(fs.readFileSync(path.resolve('public/riff1.mp3')));
  const audioId2 = await audioData.addAudioDirect(fs.readFileSync(path.resolve('public/riff2.mp3')));
  const audioId3 = await audioData.addAudioDirect(fs.readFileSync(path.resolve('public/riff3.mp3')));
  const audioId4 = await audioData.addAudioDirect(fs.readFileSync(path.resolve('public/riff4.mp3')));

  const blank_tab = "e|---------------------------------------------------------------|\nB|---------------------------------------------------------------|\nG|---------------------------------------------------------------|\nD|---------------------------------------------------------------|\nA|---------------------------------------------------------------|\nE|---------------------------------------------------------------|";

  // Create posts
  const post1 = await postData.addPost(
    "Bluesy Solo Lick",
    user1._id,
    audioId1,
    blank_tab,
    "A minor",
    "Guitar",
    ["rock", "blues", "solo", "slow"]
  );

  const post2 = await postData.addPost(
    "Alternative Rock Riff",
    user2._id,
    audioId2,
    blank_tab,
    "E major",
    "Guitar",
    ["rock", "alternative", "riff", "fast"]
  );

  const post3 = await postData.addPost(
    "Indie Riff",
    user1._id,
    audioId3,
    blank_tab,
    "F# minor",
    "Guitar",
    ["indie", "riff", "fast", "fun"]
  );

  const post4 = await postData.addPost(
    "Slow Trumpet Jazz",
    user3._id,
    audioId4,
    "N/A",
    "C major",
    "Trumpet",
    ["jazz", "slow", "trumpet"]
  );

  // Create comments
  const comment1 = await commentData.addComment(
    "Great post!",
    user2._id,
    post1._id
  );

  const comment2 = await commentData.addComment(
    "I love this riff!",
    user1._id,
    post2._id
  );

  const comment3 = await commentData.addComment(
    "Would love to play this on trumpet......",
    user3._id,
    post3._id
  );

  const comment4 = await commentData.addComment(
    "I could do a great bassline under this!",
    user4._id,
    post2._id
  );

  const comment5 = await commentData.addComment(
    "Awesome playing",
    user1._id,
    post4._id
  );

  console.log("Database seeded successfully");
  await closeConnection();
};

main().catch(console.error);