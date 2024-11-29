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
};

export default exportedMethods;
