function showElement(element, className) {
  element.classList.remove(className + "--hidden");
}

function hideElement(element, className) {
  element.classList.add(className + "--hidden");
}

function addElementState(element, state) {
  const className = element.classList[0];
  element.classList.add(`${className}--${state}`);
}

function removeElementState(element, state) {
  const className = element.classList[0];
  element.classList.remove(`${className}--${state}`);
}

function elementHasClassName(element, className) {
  return element.classList.contains(className);
}

function elementHasState(element, state) {
  const className = element.classList[0];
  return element.classList.contains(`${className}--${state}`);
}

function getElementAncestor(element, ancestorIdentifier) {
  return element.closest(ancestorIdentifier);
}
