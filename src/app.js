import Router from './router.js';
import Auth from './pages/auth.js';
import Menu from './pages/menu.js';
import Results from './pages/results.js'
import ErrorPage from './pages/error.js';
import Games from './pages/games.js'
import Sound from './components/sound.js'


export default class App {
  constructor(container) {
    this._container = container;
    
    this._auth = new Auth(this._container);
    this._menu = new Menu(this._container);
    this._results = new Results(this._container);
    this._error = new ErrorPage(this._container);
    this._games = new Games(this._container);
    this._sound = new Sound();
    this._sound.init();
    this._sound.addListener();

    const routes = {
      "/login": this._auth.init.bind(this._auth, 'login'),
      "/signup": this._auth.init.bind(this._auth, 'signup'),
      "/menu": this._menu.init.bind(this._menu),
      "/results": this._results.init.bind(this._results),
      "/error": this._error.init.bind(this._error),
      "/game/hangman": this._games.chooseGame.bind(this._games, 'hangman'),
      "/game/word_search": this._games.chooseGame.bind(this._games, 'word_search'),
      "/game/matching_pairs": this._games.chooseGame.bind(this._games, 'matching_pairs'),
      "/game/quiz": this._games.chooseGame.bind(this._games, 'quiz'),
      "/game/anagram": this._games.chooseGame.bind(this._games, 'anagram')
    };
    this._router = new Router(routes);
  }

  init() {
    this._router.handleRouteChange();

    window.addEventListener('resize', () => {
      const words = document.querySelectorAll('.word');
      words.forEach(word => {
        const wordRect = word.getBoundingClientRect();
        if (wordRect.right < 20 || 
            wordRect.bottom < 20 || 
            wordRect.left > (window.innerWidth-200) || 
            wordRect.top > window.innerHeight-200) {
          word.remove();
        }
      });
    });
  }
}