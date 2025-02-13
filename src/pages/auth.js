import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebaseConfig.js';
import { ModelBack } from '../components/modelBack.js'
import { ViewBack } from "../components/viewBack.js";
import createDivBox from  '../components/commonBox.js';
import anime from 'animejs/lib/anime.es.js';

import '../styles/common.css'
import '../styles/auth_and_menu.css'
import '../styles/auth.css'


class ViewAuth extends ViewBack {
  constructor(container) {
    super(container)
    this._login = null;
    this._signup = null;
    this._idTimer = null;
    this._errorLogin = null;
    this._errorSignup = null;
  }

  init(words, login) {
    this._container.innerHTML = "";
    const pageAuth = document.createElement('div');
    pageAuth.classList.add("main-page");
    document.title = "Finnish Learn";

    this._login = this.renderLogin();
    pageAuth.appendChild(this._login);

    this._signup = this.renderSignup();
    pageAuth.appendChild(this._signup);

    this.updateView(login);

    this._container.appendChild(pageAuth);
    this.addSoundBtn();

    this.generateBackgroundWords(words);
  }

  renderLogin() {
    const auth = createDivBox(["main-page-box", "main-page-login"]);

    const hello = document.createElement('h2');
    hello.textContent = "Tervetuloa, ystäväni!";
    auth.append(hello);

    this._errorLogin = document.createElement('p');
    this._errorLogin.textContent = "Your password/email is incorrect!";
    this._errorLogin.classList.add("error-hide");
    this._errorLogin.setAttribute("id", "error");
    auth.append(this._errorLogin);

    const email = document.createElement("input");
    email.setAttribute("type", "email");
    email.setAttribute("placeholder", "Enter your email");
    email.setAttribute("id", "email");
    auth.appendChild(email);

    const password = document.createElement("input");
    password.setAttribute("type", "password");
    password.setAttribute("placeholder", "Enter your password");
    password.setAttribute("id", "password");
    auth.appendChild(password);

    const login = document.createElement('button');
    login.setAttribute("id", "login");
    login.textContent = "Log In";
    auth.appendChild(login);

    const separator = document.createElement('div');
    separator.classList.add("separator");
    auth.appendChild(separator);

    const signup = document.createElement('button');
    signup.setAttribute("id", "signup");
    signup.textContent = "Sign up";
    auth.appendChild(signup);

    return auth;
  }

  renderSignup() {
    const auth = createDivBox(["main-page-box", "main-page-signup"]);

    this._errorSignup = document.createElement('p');
    this._errorSignup.textContent = "Your password/email is incorrect!";
    this._errorSignup.classList.add("error-hide");
    this._errorSignup.setAttribute("id", "error");
    auth.append(this._errorSignup);

    const email = document.createElement("input");
    email.setAttribute("type", "email");
    email.setAttribute("placeholder", "Enter your email");
    email.setAttribute("id", "email-signup");
    auth.appendChild(email);

    const password = document.createElement("input");
    password.setAttribute("type", "password");
    password.setAttribute("placeholder", "Enter your password");
    password.setAttribute("id", "password-signup");
    auth.appendChild(password);

    const passwordConfirm = document.createElement("input");
    passwordConfirm.setAttribute("type", "password");
    passwordConfirm.setAttribute("placeholder", "Confirm your password");
    passwordConfirm.setAttribute("id", "passwordConfirm");
    auth.appendChild(passwordConfirm);

    const signup = document.createElement('button');
    signup.setAttribute("id", "signup-signup");
    signup.textContent = "Sign up";
    auth.appendChild(signup);

    const separator = document.createElement('div');
    separator.classList.add("separator");
    auth.appendChild(separator);

    const login = document.createElement('button');
    login.setAttribute("id", "login-signup");
    login.textContent = "Log In";
    auth.appendChild(login);

    return auth;
  }

  updateView(login) {
    this.clearErrorsAndFields();
    window.history.pushState({}, '', login ? "/login" : '/signup');
    if (login) {
      this._signup.classList.remove("show-signup");
      this._signup.classList.add("hide-signup");
      this._login.classList.remove("hide-login");
      this._login.classList.add("show-login");
    }
    else {
      this._signup.classList.remove("hide-signup");
      this._signup.classList.add("show-signup");
      this._login.classList.remove("show-login");
      this._login.classList.add("hide-login");
    }
  }

  clearErrorsAndFields() {
    this._errorLogin.className = "";
    this._errorSignup.className = "";
    this._errorLogin.classList.add("error-hide");
    this._errorSignup.classList.add("error-hide");
    const inputs = this._container.querySelectorAll("input");
    inputs.forEach(elem => elem.value = "");
  }

  loginFun() {
    clearInterval(this._idTimer);
    this._errorLogin.className = "";
    this._errorLogin.classList.add("error-hide");
    this._login.classList.remove("show-login");
    this._login.classList.add("hide-login");
    setTimeout(() => {
      window.history.pushState({}, '', '/menu');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, 1000);
  }

  loginFunError() {
    this._errorLogin.className = "";
    this._errorLogin.classList.add("error-show");
  }

  signupFunError() {
    this._errorSignup.className = "";
    this._errorSignup.classList.add("error-show");
  }
}

class ModelAuth extends ModelBack {
  constructor(view) {
    super(view)
    this._login = true;
  }

  async init(state) {
    this._login = state === 'login';
    const words = await this.getAllWords();
    this._view.init(words , this._login);
  }

  updateModelView() {
    this._login = !this._login;
    this._view.updateView(this._login);
  }

  async loginModelFun(email, password) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      this._view.loginFun();
    }
    catch (error) {
      this._view.loginFunError();
    }
  }

  async signupModelFun(email, password, confirmPassword) {
    if (password !== confirmPassword) {
      this._view.signupFunError();
    }
    else {
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        this.updateModelView();
      }
      catch (error) {
        this._view.signupFunError();
      }
    }
  }
}

class ControllerAuth {
  constructor(container, model) {
    this._container = container;
    this._model = model;
  }

  async init(state) {
    await this._model.init(state);
    this.addListener();
  }

  addListener() {
    const login = this._container.querySelector('#login');
    login.addEventListener('click', (event) => {
      event.preventDefault();
      this._model.loginModelFun(
        this._container.querySelector('#email').value,
        this._container.querySelector('#password').value,
      );
    });

    this._container.querySelector('#signup-signup').addEventListener('click', (event) => {
      event.preventDefault();
      this._model.signupModelFun(
        this._container.querySelector('#email-signup').value,
        this._container.querySelector('#password-signup').value,
        this._container.querySelector('#passwordConfirm').value
      );
    });

    this._container.querySelector('#signup').addEventListener('click', this.updateView.bind(this));
    this._container.querySelector('#login-signup').addEventListener('click', this.updateView.bind(this));
  }

  updateView(event) {
    event.preventDefault();
    this._model.updateModelView();
  }
}

export default class Auth {
  constructor(container) {
    this._container = container;
    this._view = new ViewAuth(this._container);
    this._model = new ModelAuth(this._view);
    this._controller = new ControllerAuth(this._container, this._model);
  }

  init(state) {
    this._controller.init(state);
  }
}