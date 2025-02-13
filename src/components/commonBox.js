export default function createDivBox(classNames) {
  const gameElement = document.createElement('div');
  classNames.forEach(className => gameElement.classList.add(className));
  return gameElement;
}