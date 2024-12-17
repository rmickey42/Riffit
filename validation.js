import { ObjectId } from "mongodb";

const MAX_PFP_SIZE = 1000000; // 1 MB

const exportedMethods = {
  checkString(str, valName) {
    if (!str) throw `No input for ${valName}`;
    if (!valName) throw `No name for ${str}`;
    if (typeof str !== "string") throw `${valName} is not a string`;
    if (str.trim().length === 0) throw `${valName} is empty`;
    return str.trim();
  },

  checkStrType(str, valName) {
    if (!valName) throw `No name for ${str}`;
    if (typeof str !== "string") throw `Bio is not a string`;
    return str.trim();
  },

  checkTags(tags) {
    tags = this.checkStringArray(tags, "tags");
    tags.forEach((tag, i) => {
      tag = this.checkString(tag, `Tag ${i}`);
      if (tag.length > 15) throw `Tag ${i} is too long`;
      if (tag.length < 2) throw `Tag ${i} is too short`;
      tags[i] = tag;
    });
    return tags;
  },

  checkId(id, idName) {
    id = this.checkString(id, idName);
    if (!ObjectId.isValid(id)) throw `${idName} is not a valid ObjectId`;
    return id;
  },

  checkNum(num, valName) {
    if (!num && !(num===0)) throw `No input for ${valName}`;
    if (!valName) throw `No name for ${num}`
    if (num === undefined) throw `${valName} is undefined`;
    if (typeof num !== "number") throw `${valName} is not a number`;
    if (isNaN(num)) throw `${valName} is NaN`;
    if (num === Infinity) throw `${valName} is Infinity`;
    if (num < 0) throw `${valName} is a negative number`;
    if (!Number.isInteger(num)) throw `${valName} is not an integer`;
    return num;
  },

  checkStringArray(arr, valName) {
    if (!arr || !Array.isArray(arr))
      throw `You must provide an array of ${valName}`;
    if (!valName) throw `No name for string array`;
    for (let i = 0; i < arr.length; i++) {
      arr[i] = this.checkString(arr[i], `${valName} element`);
    }
    return arr;
  },

  checkRefId(arr, refName) {
    if (!arr || !Array.isArray(arr))
      throw `You must provide an array of ${refName}`;
    if (!valName) throw `No name for Id array`;
    arr.forEach((element) => {
      element = this.checkId(arr[i]);
    });
  },

  checkUsername(str, refName) {
    // Usernames can only contain letters and numbers
    str = this.checkString(str, refName);
    if (!refName) throw `No name for ${str}`;
    if (/[^a-zA-Z\d]/.test(str))
      throw `${refName} must only contain letters and numbers`;
    if (str.length < 4 && str.length > 15)
      throw `${refName} must be between 4 and 15 characters`;

    // for(let i in str){
    //   if(!alpha_numer.includes(str[i].toLowerCase())) throw `${refName || str} contains invalid character ${str[i]}`;
    // }
    return str.toLocaleLowerCase();
  },

  checkPassword(str, refName) {
    str = this.checkString(str, refName);
    if (str.length < 5) throw `Passwords must be at least 5 chatacters`;
    if (str.length > 16) throw `Passwords cannot be longer than 16 characters.`;
    let capital_count = 0,
      symbol_count = 0,
      number_count = 0;
    for (let i in str) {
      let char = str[i].toLowerCase();
      if (char != str[i]) capital_count++;
      else if (numbers.includes(char)) number_count++;
      else if (good_symbols.includes(char)) symbol_count++;
      else if (!alphabet.includes(char))
        throw `Passwords cannot contain the symbol '${char}'`;
    }

    if (capital_count < 1)
      throw `Passwords must contain at least 1 capital letter`;
    if (symbol_count < 1) throw `Passwords must contain at least 1 symbol`;
    if (number_count < 1) throw `Passwords must contain at least 1 number`;

    return str;
  },

  checkProfilePicture(file) {
    if (!file) {
      throw "No image file provided";
    }
    if (file.mimetype !== "image/jpeg") {
      throw "Image must be a JPEG file";
    }
    if (file.size > MAX_PFP_SIZE) {
      throw "Image too large";
    }

    return file.buffer;
  }
};

let alphabet = "qwertyuiopasdfghjklzxcvbnm";
let numbers = "1234567890";
let good_symbols = "!@#$%^&*<>?/-_+=()[]{}:;";

export default exportedMethods;
