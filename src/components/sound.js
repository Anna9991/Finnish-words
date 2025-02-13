import { ref as storageRef, getDownloadURL } from "firebase/storage";
import { ref, onValue, set, get } from "firebase/database";
import { database, storage } from '../firebaseConfig.js';


export default class Sound {
  constructor() {
    this._isMuted = false;
    this._currentAudio = null;
  }

  init() {
    const isMuted = ref(database, 'isMuted');
    set(isMuted, true);
    onValue(isMuted, (snapshot) => {
      this._isMuted = snapshot.val();
      this._isMuted ? this.stopSound() : this.playSound();
    });
  }

  addListener() {
    window.addEventListener('click', async (event) => {
      if (event.target && event.target.id === 'sound') {
        const sound = event.target;
        sound.textContent = await this.toggle();
      }
    });
  }

  async isMuted() {
    const isMuted = ref(database, 'isMuted');
    try {
      const snapshot = await get(isMuted);
      this._isMuted = snapshot.val();
    }
    catch (error) {
      console.error("Error from Firebase:", error);
    }
    return this._isMuted;
  }

  playSound() {
    if (this._currentAudio && !this._currentAudio.paused) {
      console.log("Звук уже воспроизводится, не запускаем новый.");
      return;
    }
    const background = ref(database, 'sounds/background');
    onValue(background, async (snapshot) => {
      const path = snapshot.val();
      if (path) {
        try {
          const url = await getDownloadURL(storageRef(storage, path));
          this._currentAudio = new Audio(url);
          await this._currentAudio.play();
        }
        catch (error) {
          console.error("Ошибка:", error);
        }
      }
      else {
        console.error("Путь!!!");
      }
    });
  }

  stopSound() {
    if (this._currentAudio) {
      this._currentAudio.pause();
      this._currentAudio.currentTime = 0;
      this._currentAudio = null;
    }
  }

  async toggle() {
    const isMuted = ref(database, 'isMuted');
    try {
      await set(isMuted, !this._isMuted);
    } 
    catch (error) {
        console.error("Ошибка:", error);
    }
    return this._isMuted ? '▶' : '⏸';
  }

  async congrats(message) {
    if(await this.isMuted()) {
      return;
    }
    const congrats = ref(database, `sounds/${message ? "sad": "win"}`);
    onValue(congrats, async (snapshot) => {
      const path = snapshot.val();
      if (path) {
        try {
          const url = await getDownloadURL(storageRef(storage, path));
          const mes = new Audio(url);
          await mes.play();
          setTimeout(() => {
            mes.pause();
          }, 5000);
        }
        catch (error) {
          console.error("Ошибка:", error);
        }
      }
      else {
        console.error("Путь!!!");
      }
    });
  }
}