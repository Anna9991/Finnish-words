import { ModelBack } from '../components/modelBack.js';
import { ViewBack } from "../components/viewBack.js";
import BaseGame from './basegame.js'
import createDivBox from  '../components/commonBox.js';

import '../styles/common.css'
import '../styles/auth_and_menu.css'
import '../styles/hangman.css'


class ViewHangman extends ViewBack {
  constructor(container) {
    super(container)
    this._wordContainer = null;
    this._startBtn = null;
  }

  init(words) {
    this._container.innerHTML = "";
    this.renderGame();
    this.generateBackgroundWords(words);
  }

  renderGame() {
    const pageGame = document.createElement('div');
    pageGame.classList.add("main-page");
    pageGame.classList.add("hang-page");
    document.title = "Hangman";

    const gameBox = createDivBox(["main-page-box", "show-menu"]);

    const hangmanCanvas = document.createElement('canvas');
    hangmanCanvas.width = 220;
    hangmanCanvas.height = 220;
    hangmanCanvas.setAttribute('id', 'hangmanCanvas');
    gameBox.appendChild(hangmanCanvas);

    this._wordContainer = document.createElement('div');
    this._wordContainer.classList.add("word-display");
    gameBox.appendChild(this._wordContainer);

    const alphabet = 'AÄBCDEFGHIJKLMNOÖPRSTUVXY'.split('');
    const keyboard = document.createElement('div');
    keyboard.classList.add("keyboard");
    keyboard.innerHTML = alphabet.map(letter => `<button class='button-letter'>${letter}</button>`).join('');
    gameBox.appendChild(keyboard);

    const hint = createDivBox(["hint"]);
    hint.textContent = `Hint: Press Start!`;
    gameBox.append(hint);
    this._hint = hint;

    const lives = createDivBox(["lives"]);
    lives.textContent = `Lives: 3/3`;
    gameBox.append(lives);
    this._lives = lives;

    const time = createDivBox(["time"]);
    time.textContent = "Time: 0:0";
    gameBox.append(time);
    this._time = time;

    const start = document.createElement('button');
    start.setAttribute("id", 'start');
    start.textContent = 'Start';
    gameBox.appendChild(start);
    this._startBtn = start;

    const menu = document.createElement('button');
    menu.setAttribute("id", 'menu');
    menu.textContent = 'Menu';
    gameBox.appendChild(menu);

    pageGame.appendChild(gameBox);
    this._container.appendChild(pageGame);
    this._page = gameBox;

    this.addSoundBtn();
    this.createModal();
    this.updateWord("H A N G M A N");
    this.renderHangman(0);
  }

  renderHangman(lives) {
    const canvas = document.getElementById('hangmanCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    // висельница 
    ctx.beginPath();
    ctx.moveTo(50, 200);
    ctx.lineTo(150, 200);
    ctx.moveTo(100, 200);
    ctx.lineTo(100, 50);
    ctx.lineTo(150, 50);
    ctx.lineTo(150, 70);
    ctx.stroke();

    if (lives < 3) {
      // головa
      ctx.beginPath();
      ctx.arc(150, 85, 10, 0, Math.PI * 2, true);
      ctx.stroke();
      // тело
      ctx.beginPath();
      ctx.moveTo(150, 95);
      ctx.lineTo(150, 130);
      ctx.stroke();
    }
    if (lives < 2) {
      // руки
      ctx.beginPath();
      ctx.moveTo(150, 105);
      ctx.lineTo(140, 120);
      ctx.moveTo(150, 105);
      ctx.lineTo(160, 120);
      ctx.stroke();
    }
    if (lives < 1) {
      // ноги
      ctx.beginPath();
      ctx.moveTo(150, 130);
      ctx.lineTo(140, 140);
      ctx.moveTo(150, 130);
      ctx.lineTo(160, 140);
      ctx.stroke();
    }
  }

  updateWord(word) {
    this._wordContainer.textContent = word;
  }

  updateHint(category = null) {
    this._hint.textContent = `Hint: ${category ? category : 'Keep up with good work!'}`;
  }

  updateLives(lives) {
    this._lives.textContent = `Lives: ${lives}/3`;
  }

  updateStart() {
    this._startBtn.textContent = 'Start again';
  }
}

class ModelHangman extends ModelBack {
  constructor(view) {
    super(view)
    this._base = new BaseGame(view);
    this._lives = 3;
    this._randomWord = null;
    this._selectedLetters = [];
  }

  async init() {
    this._words = await this.getAllWords();
    this._view.init(this._words);
  }

  logoutModelFun(hash) {
    if (this._isStarted) {
      this._base.stop();
    }
    this._view.logoutFun('/' + hash.toLowerCase());
  }

  start() {
    if (this._isStarted) {
      this._base.stop();
    }
    this._isStarted = true;
    this._randomWord = this._words[Math.floor(Math.random() * this._words.length)];
    this._view.updateHint(this._randomWord.category);
    this._view.updateWord('_'.repeat(this._randomWord.fi.split('').length).split('').join(' '));
    this._view.updateStart();
    console.log("before",this._lives);
    this._lives = 3;
    this._selectedLetters = [];
    this._view.updateLives(this._lives);
    this._view.renderHangman(this._lives);
    this._base.start();
    console.log("after",this._lives);
  }

  async checkGuess(letter) {
    console.log("check", this._lives);
    const wordArr = this._randomWord.fi.split('');
    if (wordArr.includes(letter)) {
      this._selectedLetters.push(letter);
      const word = wordArr.map(l => this._selectedLetters.includes(l) ? l : '_').join(' ');
      this._view.updateWord(word);
      if (wordArr.every(l => this._selectedLetters.includes(l))) {
        this._base.stop();
        await this._base.saveResults('hangman');
        this._view.showMessage();
      }
    }
    else {
      this._lives--;
      this._view.updateLives(this._lives);
      this._view.renderHangman(this._lives);
      if (this._lives === 0) {
        this._base.stop();
        this._view.showMessage(true);
        return;
      }
    }
  }
}


class ControllerHangman {
  constructor(container, model) {
    this._container = container;
    this._model = model;
    this._idTimer = null;
  }

  async init() {
    await this._model.init();

    const menu = this._container.querySelector("#menu");
    menu.addEventListener("click", this.logoutFun.bind(this));

    const menumodal = this._container.querySelector(".menu-modal");
    menumodal.addEventListener("click", this.logoutFun.bind(this));

    const results = this._container.querySelector("#results");
    results.addEventListener("click", this.logoutFun.bind(this));

    const start = this._container.querySelector("#start");
    start.addEventListener("click", this.start.bind(this));
  }

  logoutFun(event) {
    event.preventDefault();
    this._model.logoutModelFun(event.target.id);
  }

  start(event) {
    event.preventDefault();
    this._model.start();
    this._container.querySelectorAll('.keyboard button').forEach(button => {
      button.disabled = false;
      if (!button.dataset.listenerAdded) {
        button.addEventListener('click', async () => {
          await this._model.checkGuess(button.textContent.toLowerCase());
          button.disabled = true;
        });
        button.dataset.listenerAdded = "true";
      }
    });    
  }
}

export default class Hangman {
  constructor(container) {
    this._container = container;
    this._view = new ViewHangman(this._container);
    this._model = new ModelHangman(this._view);
    this._controller = new ControllerHangman(this._container, this._model);
  }

  init() {
    this._controller.init();
  }
}