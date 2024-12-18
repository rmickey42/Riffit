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
  const audioId1 = await audioData.addAudioDirect(fs.readFileSync(path.resolve('public/riffs/riff1.mp3')));
  const audioId2 = await audioData.addAudioDirect(fs.readFileSync(path.resolve('public/riffs/riff2.mp3')));
  const audioId3 = await audioData.addAudioDirect(fs.readFileSync(path.resolve('public/riffs/riff3.mp3')));
  const audioId4 = await audioData.addAudioDirect(fs.readFileSync(path.resolve('public/riffs/riff4.mp3')));
  const audioId5 = await audioData.addAudioDirect(fs.readFileSync(path.resolve('public/riffs/BassThing.mp3')));
  const audioId6 = await audioData.addAudioDirect(fs.readFileSync(path.resolve('public/riffs/HendrixyThing.mp3')));
  const audioId7 = await audioData.addAudioDirect(fs.readFileSync(path.resolve('public/riffs/IronMaidenThing.mp3')));
  const audioId8 = await audioData.addAudioDirect(fs.readFileSync(path.resolve('public/riffs/SRVThing.mp3')));

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

  const post5 = await postData.addPost(
    "Funk Overload",
    user4._id,
    audioId5,
    "N/A",
    "E minor",
    "Bass",
    ["bass", "funk", "fast", "blues"]
  );

  const post6 = await postData.addPost(
    "Hendrix Style Resolution",
    user1._id,
    audioId6,
    "N/A",
    "A major",
    "Guitar",
    ["hendrix", "stratocaster", "guitar", "slow", "rock"]
  );

  const post7 = await postData.addPost(
    "Iron Maiden - The Trooper",
    user2._id,
    audioId7,
    "N/A",
    "E minor",
    "Guitar",
    ["metal", "rock", "guitar", "overdrive", "heavy"]
  );

  const post8 = await postData.addPost(
    "SRV Trill",
    user1._id,
    audioId8,
    "N/A",
    "E minor",
    "Guitar",
    ["country", "blues", "pentatonic", "srv", "rock"]
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

  const comment6 = await commentData.addComment(
    "Professor Hill Would like this one",
    user1._id,
    post7._id
  );

  const comment7 = await commentData.addComment(
    "Interesting, not my cup of tea though",
    user3._id,
    post6._id
  );

  const comment8 = await commentData.addComment(
    "Needs more bass",
    user4._id,
    post6._id
  );

  // Add likes
  await postData.postLike(post1._id, user2._id);
  await postData.postLike(post2._id, user1._id);
  await postData.postLike(post3._id, user3._id);
  await postData.postLike(post4._id, user4._id);

  // Add dislikes
  await postData.postDislike(post5._id, user1._id);
  await postData.postDislike(post6._id, user2._id);
  await postData.postDislike(post7._id, user3._id);
  await postData.postDislike(post8._id, user4._id);

  // Add favorites
  await postData.postFavorite(post1._id, user1._id);
  await postData.postFavorite(post2._id, user2._id);
  await postData.postFavorite(post3._id, user3._id);
  await postData.postFavorite(post4._id, user4._id);

  console.log("Database seeded successfully");
  await closeConnection();
};

main().catch(console.error);