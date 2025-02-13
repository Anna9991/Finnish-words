import '../styles/common.css'
import '../styles/error.css'


export default class ErrorPage {
  constructor(container) {
    this._container = container;
  }

  init() {
    this._container.innerHTML = "";
    document.title = "Error";
    const message = document.createElement("div");
    message.id = "container";
    message.innerHTML = '<div class="message">Ooops!</div><div class="errorcode">404</div>';
    this._container.append(message);
  }
}