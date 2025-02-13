import { auth } from '../firebaseConfig.js';
import { ref, get, set, push, query, orderByChild } from "firebase/database";
import { database } from '../firebaseConfig.js';


export default class BaseGame {
  constructor(view) {
    this._score = 0;
    this._startTime = null;
    this._duration = null;
    this._min = null;
    this._sec = null;
    this._idTimer = null;
    this._view = view;
  }

  start() {
    this._startTime = Date.now();
    this._idTimer = setInterval(() => { this.updateTime(); }, 1000);
  }

  stop() {
    clearInterval(this._idTimer);
    this.updateTime();
  }

  updateTime() {
    this._duration = Date.now() - this._startTime;
    this._min = Math.floor(this._duration / 60000);
    this._sec = Math.floor((this._duration % 60000) / 1000);
    this._view.updateTime(this._min, this._sec);
  }

  async saveResults(game, lives = 3) {
    const user = auth.currentUser;
    if (user) {
      try {
        const resultsRef = ref(database, `results/${game}`);
        const averageTime = await this.getAverageTime(resultsRef);
        if (averageTime) {
          this._score = 60 * (averageTime / this._duration) + 40 * lives;
        }
        else {
          this._score = 60 + 40 * lives;
        }
        const newResultRef = push(resultsRef);
        await set(newResultRef, {
          userId: user.uid,
          userEmail: user.email,
          time: this._duration,
          score: this._score,
          timestamp: Date.now()
        });
      }
      catch (error) {
        console.error("Error saving result - ", error);
      }
    }
  }

  async getAverageTime(resultsRef) {
    try {
      const snapshot = await get(query(resultsRef, orderByChild('time')));
      let totalTime = 0;
      let players = 0;
      snapshot.forEach(snap => {
        const result = snap.val();
        totalTime += result.time;
        players += 1;
      });
      return players ? (totalTime / players) : null;
    } 
    catch (error) {
      console.error("Error fetching average time:", error);
    }
  }
}