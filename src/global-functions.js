function showElement(element, className) {
  element.classList.remove(className + "--hidden");
}

function hideElement(element, className) {
  element.classList.add(className + "--hidden");
}

function addElementClassNameModifier(element, className, classNameModifier) {
  element.classList.add(`${className}--${classNameModifier}`);
}

function removeElementClassNameModifier(element, className, classNameModifier) {
  element.classList.remove(`${className}--${classNameModifier}`);
}

function elementHasClassName(element, className) {
  element.classList.contains(className);
}

function elementHasClassNameModifier(element, className, classNameModifier) {
  element.classList.contains(`${className}--${classNameModifier}`);
}

function getElementAncestor(element, ancestorIdentifier) {
  element.closest(ancestorIdentifier);
}
