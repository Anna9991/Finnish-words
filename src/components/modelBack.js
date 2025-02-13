import { ref, get } from "firebase/database";
import { database } from '../firebaseConfig.js';


export class ModelBack {
  constructor(view) {
    this._view = view;
    this._isStarted = false;
    this._words = null;
  }

  async getAllWords() {
    const words = ref(database, 'words');
    try {
      const data = await get(words);
      if (data.exists()) {
        const wordsData = data.val();
        return Object.values(wordsData);
      }
      else {
        console.error("Empty Firebase");
        return this.defaultWords();
      }
    }
    catch (error) {
      console.error("Error from Firebase:", error);
      return this.defaultWords();
    }
  }

  defaultWords() {
    return [
      {fi: "rakkaus", en: "love", category: "emotion"},
      {fi: "ystävä", en: "friend", category: "social connection"},
      {fi: "metsä", en: "forest", category: "nature"},
      {fi: "meri", en: "sea", category: "nature"}
    ];
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}