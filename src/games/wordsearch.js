import { ModelBack } from '../components/modelBack.js';
import { ViewBack } from "../components/viewBack.js";
import createDivBox from  '../components/commonBox.js';
import BaseGame from './basegame.js'

import '../styles/common.css'
import '../styles/auth_and_menu.css'
import '../styles/wordsearch.css'


class ViewWordSearch extends ViewBack {
  constructor(container) {
    super(container)
    this._field = null;
    this._gameBox = null;
    this._startBtn = null;
  }

  async init(words, letters) {
    this._container.innerHTML = "";
    document.title = "Word search";
    this.renderField(letters);
    await this.addSoundBtn();
    this.generateBackgroundWords(words);
  }

  renderField(letters) {
    const pageGame = createDivBox(["main-page"]);

    const gameBox = createDivBox(["main-page-box", "show-menu"]);
    this._gameBox = gameBox;
    const grid = createDivBox(["grid"]);
    this._gameBox.append(grid);
    this._field = grid;
    this.updateField(letters);

    const hint = createDivBox(["hint"]);
    hint.textContent = `Hint: Press Start!`;
    gameBox.append(hint);
    this._hint = hint;

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

    this._page = gameBox;
    pageGame.appendChild(gameBox);
    this._container.appendChild(pageGame);
    
    this.createModal();
  }

  updateCurrentCell(row, col) {
    this._field.querySelectorAll('.cell').forEach(cell => { cell.classList.remove('highlighted'); });
    const currentCell = this._field.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (currentCell) {
      currentCell.classList.add('highlighted');
    }
  }

  updateHint(words) {
    this._hint.textContent = `Hint: ${words.length ? words.join(', ') : 'Keep up with good work!'}`;
  }

  updateField(letters) {
    this._field.innerHTML = "";
    letters.forEach((row, rowIndex) => {
      row.forEach((letter, colIndex) => {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.innerText = letter;
        cell.dataset.row = rowIndex;
        cell.dataset.col = colIndex;
        this._field.appendChild(cell);
      });
    });
  }

  updateSelectedCells(selectedCells) {
    document.querySelectorAll('.cell').forEach(cell => {
      cell.classList.remove('selected');
    });

    selectedCells.forEach(({ row, col }) => {
      const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
      cellElement.classList.add('selected');
    });
  }

  foundWord(cells) {
    cells.forEach(({ row, col }) => {
      const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
      cellElement.classList.remove('selected');
      cellElement.classList.add('found');
    });
  }

  removeFun(savedFun) {
    document.removeEventListener('keydown', savedFun);
  }

  updateStart() {
    this._startBtn.textContent = 'Start again';
  }
}

class ModelWordSearch extends ModelBack {
  constructor(view) {
    super(view)
    this._size = 8;
    this._base = new BaseGame(view);
    this._letters = [];
    this._randomWords = null;
    this._foundWords = [];
    this._selectedCells = [];
    this._maxWordsCount = 5;
    this._usedCells = [];
    this._savedFun = null;
  }

  async init() {
    this._words = await this.getAllWords();
    for (let i = 0; i < this._size; i++) {
      const row = new Array(this._size).fill('');
      this._letters.push(row);
    }
    this.wordsInGrid(["word", "search", "game"]);
    this._view.init(this._words, this._letters);
  }

  logoutModelFun(hash) {
    if (this._isStarted) {
      this._base.stop();
    }
    this._view.logoutFun('/' + hash.toLowerCase());
  }

  getRandomWords(words) {
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    const selectedWords = shuffled.slice(0, this._maxWordsCount);
    const fi = selectedWords.map(word => word.fi);
    const en = selectedWords.map(word => word.en);
    return { fi, en };
  }

  start() {
    if (this._isStarted) {
      this._base.stop();
    }
    this._isStarted = true;
    this._letters = [];
    for (let i = 0; i < this._size; i++) {
      const row = new Array(this._size).fill('');
      this._letters.push(row);
    }
    this._randomWords = this.getRandomWords(this._words);
    this.wordsInGrid(this._randomWords.fi);
    this.randomLetters();
    this._view.updateStart();
    this._base.start();
    this._view.updateField(this._letters);
    this._view.updateHint(this._randomWords.en);
  }

  wordsInGrid(words) {
    words.forEach(word => {
      let isDone = false;
      while (!isDone) {
        const isHorizontal = this.getRandomInt(0, 1);
        const startRow = this.getRandomInt(0, this._size - 1);
        const startCol = this.getRandomInt(0, this._size - 1);

        const isEnoughSpace = (startRow, startCol, isHorizontal) => {
          if ((isHorizontal && startCol + word.length > this._size) || 
              (!isHorizontal && startRow + word.length > this._size)) {
            return false;
          }
          for (let i = 0; i < word.length; i++) {
            if ((isHorizontal && this._letters[startRow][startCol + i]) || 
                (!isHorizontal && this._letters[startRow + i][startCol])) {
              return false;
            }
          }
          return true;
        }

        if (isEnoughSpace(startRow, startCol, isHorizontal)) {
          for (let i = 0; i < word.length; i++) {
            if (isHorizontal) {
              this._letters[startRow][startCol + i] = word[i];
            }
            else {
              this._letters[startRow + i][startCol] = word[i];
            }
          }
          isDone = true;
        }
      }
    });
  }

  randomLetters() {
    const alphabet = 'AÄBCDEFGHIJKLMNOÖPRSTUVXY'.toLowerCase();
    for (let i = 0; i < this._size; i++) {
      for (let j = 0; j < this._size; j++) {
        if (!this._letters[i][j]) {
          this._letters[i][j] = alphabet[this.getRandomInt(0, alphabet.length - 1)];
        }
      }
    }
  }

  async selectCell(row, col) {
    this.updateCell(row, col);
    const cell = { row, col, letter: this._letters[row][col] };
    const isUsed = this._usedCells.some(c => c.row === row && c.col === col);
    if (isUsed) {
      return; 
    }
    const idx = this._selectedCells.findIndex(c => c.row === row && c.col === col);
    if (idx === -1) {
      this._selectedCells.push(cell);
    }
    else {
      this._selectedCells.splice(idx, 1);
    }
    this._view.updateSelectedCells(this._selectedCells);
    await this.checkWords();
  }

  updateCell(row, col) {
    this._view.updateCurrentCell(row, col);
  }

  saveFunKeyDown(fun) {
    this._savedFun = fun;
  }

  async checkWords() {
    if (!this.isOneLine()) {
      return;
    }

    const selectedWord = this._selectedCells.map(cell => cell.letter).join('');
    const reversedWord = this._selectedCells.map(cell => cell.letter).reverse().join('');

    if (this._randomWords.fi.includes(selectedWord) || this._randomWords.fi.includes(reversedWord)) {
      this._foundWords.push(selectedWord);
      this._view.foundWord(this._selectedCells);

      const index = this._randomWords.fi.indexOf(selectedWord);
      if (index !== -1) {
        this._randomWords.fi.splice(index, 1);
        this._randomWords.en.splice(index, 1);
      }
      this._view.updateHint(this._randomWords.en);
      this._usedCells.push(...this._selectedCells);
      this._selectedCells = [];

      if (this._foundWords.length === this._maxWordsCount) {
        this._view.removeFun(this._savedFun);
        this._base.stop();
        await this._base.saveResults('wordsearch');
        this._view.showMessage();
      }
    }
  }

  isOneLine() {
    if (this._selectedCells.length < 2) {
      return false;
    }
    let rows = this._selectedCells.map(cell => cell.row);
    let cols = this._selectedCells.map(cell => cell.col);
    const isRow = rows.every(row => row === rows[0]);
    const isCol = cols.every(col => col === cols[0]);

    if (isRow) {
      this._selectedCells.sort((a, b) => a.col - b.col);
      cols = this._selectedCells.map(cell => cell.col);
      return cols.every((c, i) => i === 0 || c === cols[i - 1] + 1);
    } 
    else if (isCol) {
      this._selectedCells.sort((a, b) => a.row - b.row);
      rows = this._selectedCells.map(cell => cell.row);
      return rows.every((r, i) => i === 0 || r === rows[i - 1] + 1);
    }
    return false;
  }
}


class ControllerWordSearch {
  constructor(container, model) {
    this._container = container;
    this._model = model;
    this._size = 8;
    this._currentRow = 0;
    this._currentCol = 0;
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

    const keyFun = this.keyDown.bind(this);
    document.addEventListener('keydown', keyFun);
    this._model.saveFunKeyDown(keyFun);
  }

  logoutFun(event) {
    event.preventDefault();
    this._model.logoutModelFun(event.target.id);
  }

  async start(event) {
    event.preventDefault();
    this._model.start();
    const grid = this._container.querySelector(".grid");
    if (!grid.dataset.listenerAdded) {
      grid.addEventListener('click', this.cellClick.bind(this));
      grid.dataset.listenerAdded = true;
    }   
    await this._model.updateCell(this._currentRow, this._currentCol);
  }

  async cellClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.target) {
      const cell = event.target;
      const row = cell.getAttribute('data-row');
      const col = cell.getAttribute('data-col');
      if (row !== null && col !== null) {
        this._currentRow = parseInt(row);
        this._currentCol = parseInt(col);
        await this._model.selectCell(this._currentRow, this._currentCol);
      }
    }    
  }

  async keyDown(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log(event.keyCode);
    switch (event.keyCode) {
      case 38: // ArrowUp
      {
        this._currentRow = Math.max(0, this._currentRow - 1);
        await this._model.updateCell(this._currentRow, this._currentCol);
        break;
      }
      case 40: // ArrowDown
      {
        this._currentRow = Math.min(this._size - 1, this._currentRow + 1);
        await this._model.updateCell(this._currentRow, this._currentCol);
        break;
      }
      case 37: // ArrowLeft
      {
        this._currentCol = Math.max(0, this._currentCol - 1);
        await this._model.updateCell(this._currentRow, this._currentCol);
        break;
      }
      case 39: // ArrowRight
      {       
        this._currentCol = Math.min(this._size - 1, this._currentCol + 1);
        await this._model.updateCell(this._currentRow, this._currentCol);
        break;
      }
      case 13: // Enter
      {
        await this._model.selectCell(this._currentRow, this._currentCol);
        break;
      }
      default: return;
    }
  }
}


export default class WordSearch {
  constructor(container) {
    this._container = container;
    this._view = new ViewWordSearch(this._container);
    this._model = new ModelWordSearch(this._view);
    this._controller = new ControllerWordSearch(this._container, this._model);
  }

  init() {
    this._controller.init();
  }
}