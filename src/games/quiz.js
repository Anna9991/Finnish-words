import { ModelBack } from '../components/modelBack.js';
import { ViewBack } from "../components/viewBack.js";
import BaseGame from './basegame.js'
import createDivBox from  '../components/commonBox.js';

import '../styles/common.css'
import '../styles/auth_and_menu.css'
import '../styles/quiz.css'


class ViewQuiz extends ViewBack {
  constructor(container) {
    super(container)
    this._question = null;
    this._answers = null;
    this._startBtn = null;
  }

  init(words, question) {
    this._container.innerHTML = "";
    this.renderGame();
    this.renderQuestion(question);
    this._hint.disabled = true;
    this.generateBackgroundWords(words);
  }

  renderGame() {
    const pageGame = document.createElement('div');
    pageGame.classList.add("main-page");
    pageGame.classList.add("results-page");
    document.title = "Quiz";

    const gameBox = createDivBox(["main-page-box", "show-menu"]);

    this._question = document.createElement('div');
    this._question.classList.add("question");
    gameBox.append(this._question);
    this._answers = document.createElement('div');
    this._answers.id = "answers";
    this._answers.classList.add("answers");
    gameBox.append(this._answers);

    const lives = createDivBox(["lives"]);
    lives.textContent = `Lives: 3/3`;
    gameBox.append(lives);
    this._lives = lives;

    const time = createDivBox(["time"]);
    time.textContent = "Time: 0:0";
    gameBox.append(time);
    this._time = time;

    const hint = document.createElement('button');
    hint.setAttribute("id", 'hint');
    hint.textContent = `Hint`;
    gameBox.append(hint);
    this._hint = hint;

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

  renderQuestion(question, hint) {
    this._question.textContent = `What is the meaning of the word "${question.fi}"?`;
    this._answers.innerHTML = '';

    question.en.forEach(answer => {
      const label = document.createElement('label');
      label.classList.add('answer-label');

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'answer';
      radio.value = answer;
      radio.classList.add('answer-radio');
      radio.setAttribute('data-answer', answer);

      const answerTxt = document.createElement('span');
      answerTxt.textContent = answer;

      label.appendChild(radio);
      label.appendChild(answerTxt);
      this._answers.appendChild(label);
      this._hint.disabled = hint;
    });
  }

  updateLives(lives) {
    this._lives.textContent = `Lives: ${lives}/3`;
  }

  showResult(isCorrect, selected, correct) {
    this._answers.querySelectorAll('.answer-radio').forEach(radio => {
      const answer = radio.getAttribute('data-answer');
      const label = radio.parentElement;

      if (answer === correct) {
        label.style.borderColor = 'green';
      } 
      else if (answer === selected && !isCorrect) {
        label.style.borderColor = 'red';
      }
    });
  }

  updateHint(hint) {
    this._answers.querySelectorAll('.answer-radio').forEach(radio => {
      const answer = radio.getAttribute('data-answer');
      if (hint.includes(answer)) {
        radio.disabled = true;
        const label = radio.parentElement;
        label.style.color = 'gray';
      }
    });
    this._hint.disabled = true;
  }

  updateHintBtn() {
    this._hint.disabled = false;
  }

  updateStart() {
    this._startBtn.textContent = 'Start again';
  }
}


class ModelQuiz extends ModelBack {
  constructor(view) {
    super(view)
    this._base = new BaseGame(view);
    this._question = { fi: "tietovisa", correct: 'quiz', en: ['quiz', 'uizq', 'izqu', 'zqui']};
    this._count = 0;
    this._maxCount = 5;
    this._useHint = false;
    this._lives = 3;
    this._lastWord = null;
  }

  async init() {
    this._words = await this.getAllWords();
    this._view.init(this._words, this._question);
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
    this._count = 0;
    this._maxCount = 5;
    this._useHint = false;
    this._lives = 3;
    this._lastWord = null;
    this.loadQuestion();
    this._view.updateStart();
    this._view.updateLives(this._lives);
    this._view.updateHintBtn();
    this._base.start();
  }

  async loadQuestion() {
    if (this._count < this._maxCount) {
      this._question = this.getQuestion();
      this._view.renderQuestion(this._question, this._useHint);
    }
    else {
      this._base.stop();
      await this._base.saveResults('quiz');
      this._view.showMessage();
    }
  }

  getQuestion() {
    const word = this._words[this.getRandomInt(0, this._words.length - 1)];
    let answers = [...this._words].filter(w => w.en !== word.en).sort(() => 0.5 - Math.random()).slice(0, 3).map(word => word.en);
    answers = [word.en, ...answers].sort(() => 0.5 - Math.random());
    return {fi: word.fi, correct: word.en, en: answers};
  }

  useHint() {
    let hint = [];
    if (!this._useHint) {
      this._useHint = true;
      hint = this._question.en.filter(w => w !== this._question.correct).slice(0, 2);
    }
    this._view.updateHint(hint);
  }

  checkAnswer(answer) {
    const isCorrect = answer === this._question.correct;
    if (!isCorrect) {
      this._lives--;
      this._view.updateLives(this._lives);
    }
    this._view.showResult(isCorrect, answer, this._question.correct);
    if (this._lives === 0) {
      this._base.stop();
      this._view.showMessage(true);
      return;
    }

    setTimeout(async () => {
      this._count++;
      await this.loadQuestion();
    }, 1500);
  }
}


class ControllerQuiz {
  constructor(container, model) {
    this._container = container;
    this._model = model;
    this._idTimer = null;
  }

  async init() {
    await this._model.init();

    const menu = this._container.querySelector("#menu");
    menu.addEventListener("click", this.logoutFun.bind(this));

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

    const hint = this._container.querySelector("#hint");
    if (!hint.dataset.listenerAdded) {
      hint.addEventListener("click", this.useHint.bind(this));
      hint.dataset.listenerAdded = true;
    }
    
    const menumodal = this._container.querySelector(".menu-modal");
    if (!menumodal.dataset.listenerAdded) {
      menumodal.addEventListener("click", this.logoutFun.bind(this));
      menumodal.dataset.listenerAdded = true;
    }
    

    const results = this._container.querySelector("#results");
    if (!results.dataset.listenerAdded) {
      results.addEventListener("click", this.logoutFun.bind(this));
      results.dataset.listenerAdded = true;
    }
    

    const answers = this._container.querySelector("#answers");
    if (!answers.dataset.listenerAdded) {
      answers.addEventListener("click", this.handleAnswers.bind(this));
      answers.dataset.listenerAdded = true;
    }
    
  }

  useHint(event) {
    event.preventDefault();
    this._model.useHint();
  }

  handleAnswers(event) {
    event.preventDefault();
    let value;
    if (event.target.tagName === 'LABEL') {
      value = event.target.querySelector('input[type="radio"]').value;
    }
    else if (event.target.tagName === 'SPAN') {
      value = event.target.textContent;
    }
    if (value) {
      this._model.checkAnswer(value);
    }
  }
}

export default class Quiz {
  constructor(container) {
    this._container = container;
    this._view = new ViewQuiz(this._container);
    this._model = new ModelQuiz(this._view);
    this._controller = new ControllerQuiz(this._container, this._model);
  }

  init() {
    this._controller.init();
  }
}