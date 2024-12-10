import { ObjectId } from "mongodb";

const exportedMethods = {
  checkString(str, valName) {
    if (!str) throw `No input for ${valName}`;
    if (typeof str !== "string") throw `${valName} is not a string`;
    if (str.trim().length === 0) throw `${valName} is empty`;
    return str.trim();
  },

  checkId(id, idName) {
    id = checkString(id, idName);
    if (!ObjectId.isValid(id)) throw `${idName} is not a valid ObjectId`;
    return id;
  },

  checkNum(num, valName) {
    if (!num) throw `No input for ${valName}`;
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
    for (let i in arr) {
      if (typeof arr[i] !== "string" || arr[i].trim().length === 0) {
        throw `One or more elements in ${valName} array is not a string or is an empty string`;
      }
      arr[i] = arr[i].trim();
    }
    return arr;
  },

  checkRefId(arr, refName) {
    if (!arr || !Array.isArray(arr))
      throw `You must provide an array of ${refName}`;
    // for (let i in arr) {
    //   // if (typeof arr[i] !== 'string' || arr[i].trim().length === 0) {
    //   //   throw `One or more elements in ${refName} array is not a string or is an empty string`;
    //   // }
    //   // arr[i] = arr[i].trim();

    // }
    // arr[i] = this.checkId(arr[i])
    // return arr;
    arr.forEach((element) => {
      element = this.checkId(arr[i]);
    });
  },

  checkUserName(str, refName) { // Usernames can only contain letters and numbers
    let trimmed = this.checkString(str, refName)
    for(let i in trimmed){
      if(!alpha_numer.includes(trimmed[i].toLowerCase())) throw `${refName || str} contains invalid character ${trimmed[i]}`;
    }
    return trimmed
  },

  checkPassword(str, refName) {
    let trimmed = this.checkString(str, refName)
    if (trimmed.length < 5) throw `Passwords must be at least 5 chatacters`;
    if (trimmed.length > 16) throw `Passwords cannot be longer than 16 characters.`
    let capital_count = 0,
        symbol_count = 0,
        number_count = 0;
    for(let i in trimmed){
      let char = trimmed[i].toLowerCase();
      if(char!=trimmed[i]) capital_count++;
      else if(numbers.includes(char)) number_count++;
      else if(good_symbols.includes(char)) symbol_count++;
      else if(!alphabet.includes(char)) throw `Passwords cannot contain the symbol '${char}'`;
    }

    if(capital_count < 1) throw `Passwords must contain at least 1 capital letter`;
    if(symbol_count < 1) throw `Passwords must contain at least 1 symbol`;
    if(number_count < 1) throw `Passwords must contain at least 1 number`;

    return trimmed;
  },
};

let alphabet = "qwertyuiopasdfghjklzxcvbnm"
let numbers ="1234567890"
let alpha_numer = alphabet+numbers
let good_symbols = "!@#$%^&*<>?/-_+=()[]{}:;";


export default exportedMethods;
