import Hangman from '../games/hangman.js';
import WordSearch from '../games/wordsearch.js'
import MatchingPairs from '../games/matchingpairs.js';
import Quiz from '../games/quiz.js';
import Anagram from '../games/anagram.js';
import { auth } from '../firebaseConfig.js';


export default class Games {
  constructor(container) {
    this._container = container;
  }

  chooseGame(name) {
    auth.onAuthStateChanged((user) => {
      if (user) {
        switch (name) {
          case 'hangman':
            this.startHangman();
            break;
          case 'word_search':
            this.startWordSearch();
            break;
          case 'matching_pairs':
            this.startMatchingPairs();
            break;
          case 'quiz':
            this.startQuiz();
            break;
          case 'anagram':
            this.startAnagram();
            break;
        }
      }
      else {
        window.history.replaceState({}, '/game/' + name , '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    });

  }

  startHangman() {
    new Hangman(this._container).init();
  }

  startWordSearch() {
    new WordSearch(this._container).init();
  }

  startMatchingPairs() {
    new MatchingPairs(this._container).init();
  }

  startQuiz() {
    new Quiz(this._container).init();
  }

  startAnagram() {
    new Anagram(this._container).init();
  }
}
