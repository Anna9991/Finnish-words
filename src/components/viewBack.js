import Sound from './sound.js'
import confetti from 'canvas-confetti';


export class ViewBack {
  constructor(container) {
    this._container = container;
    this._idTimer = null;
    this._page = null;
    this._modal = null;
    this._message = null;
    this._time = null;
    this._hint = null;
    this._lives = null;
    this._sound = new Sound();
  }

  async addSoundBtn() {
    const sound = document.createElement('button');
    sound.setAttribute("id", "sound");
    await this.updateSoundButtonText(sound);
    this._container.appendChild(sound);
  }

  async updateSoundButtonText(button) {
    const isMuted = await this._sound.isMuted();
    button.textContent = isMuted ? '▶' : '⏸';
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  generateBackgroundWords(words) {
    this._idTimer = setInterval(() => {
      const number = this.getRandomInt(1, 3);
      for (let i = 0; i < number; i++) {
        let word = words[this.getRandomInt(0, words.length - 1)];
        this.createWord(word);
      }
    }, 1000);
  }

  createWord(word) {
    const _word = document.createElement('div');
    _word.classList.add('word');
    _word.textContent = `${word.fi} - ${word.en}`;
    _word.style.left = this.getRandomInt(0, document.documentElement.scrollWidth - 200) + 'px';
    _word.style.top = this.getRandomInt(0, document.documentElement.scrollHeight - 100) + 'px';
    _word.style.fontSize = this.getRandomInt(20, 50) + 'px';
    this._container.appendChild(_word);

    setTimeout(() => {_word.remove()}, 10000);
  }

  createModal() {
    const modal = document.createElement('div'); 
    modal.classList.add('modal');
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    const congrats = document.createElement('p');
    congrats.classList.add('congrats');
    congrats.textContent = "Congrats! Let's check results!";
    modalContent.appendChild(congrats);
    this._message = congrats;

    const res = document.createElement('button');
    res.setAttribute("id", 'results');
    res.textContent = 'Results';
    modalContent.appendChild(res);

    const menuModal = document.createElement('button');
    menuModal.setAttribute("id", 'menu');
    menuModal.classList.add('menu-modal');
    menuModal.textContent = 'Menu';
    modalContent.appendChild(menuModal);

    modal.appendChild(modalContent);
    this._modal = modal;
    this._container.appendChild(modal);
  }

  showMessage(message = false) {
    if (message) {
      this._message.textContent = "Sorry! Let's check results!";
    }
    setTimeout(() => { 
      this._modal.style.display = 'flex';
      if (!message){
        confetti();
        confetti();
      }
    }, 1000);
    setTimeout(async () => { await this._sound.congrats(message) }, 1500);
  }

  updateTime(min, sec) {
    this._time.textContent = `Time: ${min}:${sec}`;
  }

  logoutFun(hash, isResults = false) {
    clearInterval(this._idTimer);
    if (this._modal) {
      this._modal.style.display = 'none';
    }
    if (isResults){
      this._page.classList.remove("show-menu");
    }
    this._page.classList.add("hide-menu");
    setTimeout(() => {
      window.history.pushState({}, '', hash);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, 1500);
  }
}