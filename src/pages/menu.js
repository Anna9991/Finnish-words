import { ModelBack } from '../components/modelBack.js'
import { ViewBack } from "../components/viewBack.js";
import { auth } from '../firebaseConfig.js';
import createDivBox from  '../components/commonBox.js';

import '../styles/common.css'
import '../styles/auth_and_menu.css'
import '../styles/menu.css'


class ViewMenu extends ViewBack {
  constructor(container) {
    super(container)
    this._idTimer = null;
  }

  async init(words) {
    this._container.innerHTML = "";
    const pageMenu = document.createElement('div');
    pageMenu.setAttribute("id", "menu");
    pageMenu.classList.add("main-page");
    document.title = "Menu";

    this._page = createDivBox(["main-page-box", "show-menu"]);

    const titles = ["Hangman", "Word search", "Matching pairs", "Quiz", "Anagram"];
    for (let i = 0; i < titles.length; i++) {
      const game = document.createElement('button');
      game.setAttribute("id", 'game/' + titles[i].replace(' ', '_'));
      game.textContent = titles[i];
      this._page.appendChild(game);
    }

    const res = document.createElement('button');
    res.setAttribute("id", 'results');
    res.textContent = 'Results';
    this._page.appendChild(res);

    const separator = document.createElement('div');
    separator.classList.add("separator");
    this._page.appendChild(separator);

    const logout = document.createElement('button');
    logout.setAttribute("id", "login");
    logout.textContent = "Log Out";
    this._page.appendChild(logout);

    pageMenu.appendChild(this._page);
    this._container.appendChild(pageMenu);

    await this.addSoundBtn();

    this.generateBackgroundWords(words);
  }
}

class ModelMenu extends ModelBack {
  constructor(view) {
    super(view)
  }

  async init() {
    const words = await this.getAllWords();
    auth.onAuthStateChanged((user) => {
      if (user) {
        this._view.init(words);
      }
      else {
        window.history.replaceState({}, '/menu', '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    });
  }

  logoutModelFun(hash) {
    if (hash === 'login') {
      auth.signOut();
    }
    this._view.logoutFun('/' + hash.toLowerCase());
  }
}

class ComtrollerMenu {
  constructor(container, model) {
    this._container = container;
    this._model = model;
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
    event.stopPropagation();
    if (event.target.tagName === 'BUTTON') {
      this._model.logoutModelFun(event.target.id);
    }
  }
}

export default class Menu {
  constructor(container) {
    this._container = container;
    this._view = new ViewMenu(this._container);
    this._model = new ModelMenu(this._view);
    this._controller = new ComtrollerMenu(this._container, this._model);
  }

  init() {
    this._controller.init();
  }
}