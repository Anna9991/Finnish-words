import { ModelBack } from '../components/modelBack.js';
import { ViewBack } from "../components/viewBack.js";
import BaseGame from './basegame.js'
import createDivBox from  '../components/commonBox.js';

import '../styles/common.css'
import '../styles/auth_and_menu.css'
import '../styles/match.css'


class ViewMatchingPairs extends ViewBack {
  constructor(container) {
    super(container)
    this._grid = null;
    this._startBtn = null;
  }

  init(words, size) {
    this._container.innerHTML = "";
    this.renderField();
    const values = new Array(size).fill('');
    this.renderCards(values);
    this.generateBackgroundWords(words);
  }

  renderField() {
    const pageGame = document.createElement('div');
    pageGame.classList.add("main-page");
    pageGame.classList.add("results-page");
    document.title = "Matching pair";

    const gameBox = createDivBox(["main-page-box", "show-menu"]);
    const grid = createDivBox(["grid-match"]);
    gameBox.append(grid);
    this._grid = grid;

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

    this.createModal();
    this.addSoundBtn();
  }

  renderCards(cardValues) {
    this._grid.innerHTML = "";
    cardValues.forEach(card => {
      const cardElement = document.createElement('div');
      cardElement.classList.add('card');
      cardElement.dataset.text = card.text;
      cardElement.dataset.pair = card.pair;

      cardElement.innerHTML = `
        <div class="card-inner">
          <div class="card-front"></div>
          <div class="card-back">${card.text}</div>
        </div>`;

      this._grid.appendChild(cardElement);
    });
  }

  flipCard(card) {
    card.classList.add('flipped');
  }

  unflipCard(card1, card2) {
    setTimeout(() => {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
    }, 1000);
  }

  disappearCards(card1, card2) {
    setTimeout(() => {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      card1.classList.add('disappear');
      card2.classList.add('disappear');
    }, 1000);
  }

  updateStart() {
    this._startBtn.textContent = 'Start again';
  }
}


class ModelMatchingPairs extends ModelBack {
  constructor(view) {
    super(view)
    this._base = new BaseGame(view);
    this._size = 12;
    this._flipped = [];
    this._matched = 0;
  }

  async init() {
    this._words = await this.getAllWords();
    this._view.init(this._words, this._size);
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
    this._view.renderCards(this.shuffleWords());
    this._view.updateStart();
    this._base.start();
  }

  shuffleWords() {
    let cards = [];
    let shuffledWords = [...this._words].sort(() => 0.5 - Math.random()).slice(0, this._size / 2);
    shuffledWords.forEach(word => {
      cards.push({ text: word.fi, pair: word.en });
      cards.push({ text: word.en, pair: word.fi });
    });
    return cards.sort(() => 0.5 - Math.random());
  }

  async flipCard(card) {
    if (this._flipped.length >= 2) {
      return;
    }

    this._flipped.push(card);
    this._view.flipCard(card);

    if (this._flipped.length === 2) {
      const [card1, card2] = this._flipped;
      if ((card2.dataset.text === card1.dataset.pair) ||
          (card1.dataset.text === card2.dataset.pair)) {
            this._view.disappearCards(card1, card2);
            this._matched++;
            if (this._matched === this._size / 2) {
              this._base.stop();
              await this._base.saveResults('matchingpairs');
              this._view.showMessage();
            }
          }
      else {
        this._view.unflipCard(card1, card2);
      }
      this._flipped = [];
    }
  }
}


class ControllerMatchingPairs {
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
    const grid = this._container.querySelector(".grid-match");
    if (!grid.dataset.listenerAdded) {
      grid.addEventListener('click', this.handleCellClick.bind(this));
      grid.dataset.listenerAdded = true;
    }
  }

  async handleCellClick(event) {
    event.preventDefault();
    event.stopPropagation();
    const card = event.target.closest('.card');
    if (!card || card.classList.contains('flipped')) {
      return;
    }  
    await this._model.flipCard(card);
  }
}

export default class MatchingPairs {
  constructor(container) {
    this._container = container;
    this._view = new ViewMatchingPairs(this._container);
    this._model = new ModelMatchingPairs(this._view);
    this._controller = new ControllerMatchingPairs(this._container, this._model);
  }

  init() {
    this._controller.init();
  }
}