import { ModelBack } from '../components/modelBack.js';
import { ViewBack } from "../components/viewBack.js";
import BaseGame from './basegame.js'
import createDivBox from  '../components/commonBox.js';


import '../styles/common.css'
import '../styles/auth_and_menu.css'
import '../styles/anagram.css'


class ViewAnagram extends ViewBack {
  constructor(container) {
    super(container)
    this._word = null;
    this._letters = null;
    this._startBtn = null;
  }

  init(words) {
    this._container.innerHTML = "";
    this.renderField();
    this.renderGame('anagram'.split(''), ['m','n','r','g','a','a','a'], 3);
    this.generateBackgroundWords(words);
  }

  renderField() {
    const pageGame = document.createElement('div');
    pageGame.classList.add("main-page");
    pageGame.classList.add("results-page");
    document.title = "Anagram";

    const gameBox = createDivBox(["main-page-box", "show-menu"]);

    const wordContainer = createDivBox(["word-container"]);
    wordContainer.id = 'word-container';
    gameBox.append(wordContainer);
    this._word = wordContainer;

    const letterContainer = createDivBox(["letter-container"]);
    letterContainer.id = 'letter-container';
    gameBox.append(letterContainer);
    this._letters = letterContainer;

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
  }

  renderGame(word, shuffledLetters) {
    this._word.innerHTML = '';
    this._letters.innerHTML = '';

    word.forEach((_, index) => {
      const dropZone = document.createElement('div');
      dropZone.classList.add('dropzone');
      dropZone.setAttribute('data-index', index);
      this._word.appendChild(dropZone);
    });

    shuffledLetters.forEach((letter) => {
      const letterDiv = document.createElement('div');
      letterDiv.classList.add('letter');
      letterDiv.setAttribute('draggable', true);
      letterDiv.setAttribute('data-letter', letter);
      letterDiv.textContent = letter;
      this._letters.appendChild(letterDiv);
    });
  }

  updateHint(category = null) {
    this._hint.textContent = `Hint: ${category ? category : 'Keep up with good work!'}`;
  }

  updateLives(lives) {
    this._lives.textContent = `Lives: ${lives}/3`;
  }

  dragStart(letter) {
    letter.classList.add('dragging');
  }

  dragEnd(letter) {
    letter.classList.remove('dragging');
  }

  showAnswer(letter, zone, isCorrect, removeLetter) {
    if (isCorrect) {
      zone.textContent = letter;
      zone.classList.add('correct');
      // removeLetter.remove();
      removeLetter.innerHTML = '';
      removeLetter.style.border = '2px solid white';
      removeLetter.setAttribute('draggable', false);
      removeLetter.style.cursor = 'auto';
    }
    else {
      zone.classList.add('incorrect');
    }
  }

  updateStart() {
    this._startBtn.textContent = 'Start again';
  }
}

class ModelAnagram extends ModelBack {
  constructor(view) {
    super(view)
    this._base = new BaseGame(view);
    this._randomWord = null;
    this._letter = null;
    this._lives = 3;
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
    this._view.renderGame(this._randomWord.fi.split(''), [...this._randomWord.fi].sort(() => Math.random() - 0.5));
    this._view.updateHint(this._randomWord.category);
    this._view.updateStart();
    this._lives = 3;
    this._view.updateLives(this._lives);
    this._base.start();
  }

  dragStart(letter) {
    this._letter = letter;
    this._view.dragStart(this._letter);
  }

  dragEnd() {
    this._view.dragEnd(this._letter);
  }

  drop(zone, index) {
    const letterName = this._letter.getAttribute('data-letter');
    if (letterName === this._randomWord.fi.split('')[index]) {
      this._view.showAnswer(letterName, zone, true, this._letter);
    }
    else {
      this._view.showAnswer(letterName, zone, false, this._letter);
      this._lives--;
      this._view.updateLives(this._lives);
      if (this._lives === 0) {
        this._base.stop();
        this._view.showMessage(true);
        return;
      }
    }
  }

  async checkResults(zones) {
    const isWin = Array.from(zones).every(z => z.classList.contains('correct'));
    if (isWin) {
      this._base.stop();
      await this._base.saveResults('anagram');
      this._view.showMessage();
    }
  }
}


class ControllerAnagram {
  constructor(container, model) {
    this._container = container;
    this._model = model;
    this._letterContainer = null;
    this._wordContainer = null;
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

    this._letterContainer = this._container.querySelector("#letter-container");
    this._wordContainer = this._container.querySelector("#word-container");
  }

  logoutFun(event) {
    event.preventDefault();
    this._model.logoutModelFun(event.target.id);
  }

  start(event) {
    event.preventDefault();
    this._model.start();

    this._letterContainer.querySelectorAll('.letter').forEach(letter => {
      letter.addEventListener('dragstart', this.dragStart.bind(this));
      letter.addEventListener('dragend', this.dragEnd.bind(this));
    });

    this._wordContainer.querySelectorAll('.dropzone').forEach(dropzone => {
      dropzone.addEventListener('dragover', (event) => event.preventDefault());
      dropzone.addEventListener('drop', this.drop.bind(this));
    });
  }

  dragStart(event) {
    if (event.target) {
      this._model.dragStart(event.target);
    }
  }

  dragEnd() {
    this._model.dragEnd();
  }

  async drop(event) {
    event.preventDefault();
    if (event.target) {
      const zone = event.target;
      const index = zone.getAttribute('data-index');
      this._model.drop(zone, index);
      await this._model.checkResults(this._container.querySelectorAll('.dropzone'));
    }
  }
}


export default class Anagram extends BaseGame {
  constructor(container) {
    super();
    this._container = container;
    this._view = new ViewAnagram(this._container);
    this._model = new ModelAnagram(this._view);
    this._controller = new ControllerAnagram(this._container, this._model);
  }

  init() {
    this._controller.init();
  }
}