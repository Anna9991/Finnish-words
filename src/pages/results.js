import { ModelBack } from '../components/modelBack.js';
import { ViewBack } from "../components/viewBack.js";
import createDivBox from  '../components/commonBox.js';
import { auth } from '../firebaseConfig.js';
import { ref, get, query, orderByChild, limitToFirst } from "firebase/database";
import { database } from '../firebaseConfig.js';

import '../styles/common.css'
import '../styles/auth_and_menu.css'
import '../styles/results.css'
import '../styles/menu.css'


class ViewResults extends ViewBack {
  constructor(container) {
    super(container)
    this._game1 = null;
    this._game2 = null;
    this._game3 = null;
    this._game4 = null;
    this._game5 = null;
  }

  init(words, res) {
    this._container.innerHTML = "";
    this.renderResults(res);
    this.generateBackgroundWords(words);
  }

  renderResults(res) {
    const pageResults = document.createElement('div');
    pageResults.classList.add("main-page");
    pageResults.classList.add("results-page");
    document.title = "Results";

    this._game1 = this.createList("Hangman", res.hangman);
    pageResults.appendChild(this._game1);

    this._game2 = this.createList("Word search", res.wordsearch);
    pageResults.appendChild(this._game2);

    this._game3 = this.createList("Matching pairs", res.matchingpairs);
    pageResults.appendChild(this._game3);

    this._game4 = this.createList("Quiz", res.quiz);
    pageResults.appendChild(this._game4);

    this._game5 = this.createList("Anagram", res.anagram);
    pageResults.appendChild(this._game5);

    const menu = document.createElement('button');
    menu.setAttribute("id", 'menu');
    menu.classList.add('menu-results');
    menu.textContent = 'Menu';
    pageResults.appendChild(menu);

    this._container.appendChild(pageResults);
    this._page = pageResults;
    
    this.addSoundBtn();
  }

  createList(title, res = null) {
    const gameBox = createDivBox(["main-page-box", "show-menu"]);

    const gameTitle = document.createElement('h2');
    gameTitle.textContent = title;
    gameBox.appendChild(gameTitle);

    const gameList = document.createElement('ul');
    gameList.classList.add('game-list');
    if (res) {
      for (let i = 0; i < res.length; i++) {
        const listItem = document.createElement('li');
        listItem.textContent = res[i];
        gameList.appendChild(listItem);
      }
    }
    else {
      const listItem = document.createElement('li');
      listItem.textContent = `Be First! Let's play!`;
      gameList.appendChild(listItem);
    }

    gameBox.appendChild(gameList);
    return gameBox;
  }
}

class ModelResults extends ModelBack {
  constructor(view) {
    super(view)
  }

  async init() {
    const words = await this.getAllWords();
    const res = {
      anagram: await this.getTop10ResultsForGame("anagram"),
      hangman: await this.getTop10ResultsForGame("hangman"),
      wordsearch: await this.getTop10ResultsForGame("wordsearch"),
      matchingpairs: await this.getTop10ResultsForGame("matchingpairs"),
      quiz: await this.getTop10ResultsForGame("quiz"),
    };

    auth.onAuthStateChanged((user) => {
      if (user) {
        this._view.init(words, res);
      }
      else {
        window.history.replaceState({}, '/results', '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    });
  }

  logoutModelFun(hash) {
    this._view.logoutFun('/' + hash.toLowerCase(), true);
  }

  async getTop10ResultsForGame(game) {
    const resultsRef = ref(database, `results/${game}`);
    try {
      const snapshot = await get(query(resultsRef, orderByChild('score'), limitToFirst(10)));
      if (snapshot.exists()) {
        const results = [];
        snapshot.forEach(snap => {
          results.push(snap.val());
        });
        results.reverse();
        let res = []
        for (let i = 0; i < results.length; i++) {
          res.push(`${i+1}. ${results[i].userEmail}  ${Math.round(results[i].score)}`);
        }
        return res
      }
      else {
        return null;
      }
    }
    catch (error) {
      console.error("Error - ", error);
    }
  }
}


class ControllerResults {
  constructor(container, model) {
    this._container = container;
    this._model = model;
    this._idTimer = null;
  }

  async init() {
    await this._model.init();

    const menu = this._container.querySelector("#menu");
    if (menu) {
      menu.addEventListener("click", this.logoutFun.bind(this));
    }
  }

  logoutFun(event) {
    event.preventDefault();
    this._model.logoutModelFun(event.target.id);
  }
}


export default class Results {
  constructor(container) {
    this._container = container;
    this._view = new ViewResults(this._container);
    this._model = new ModelResults(this._view);
    this._controller = new ControllerResults(this._container, this._model);
  }

  init() {
    this._controller.init();
  }
}