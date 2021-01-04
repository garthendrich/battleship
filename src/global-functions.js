const showElement = (element) => element.classList.remove(`${element.classList[0]}--hidden`);
const hideElement = (element) => element.classList.add(`${element.classList[0]}--hidden`);

const addElementState = (element, state) => element.classList.add(`${element.classList[0]}--${state}`);
const removeElementState = (element, state) => element.classList.remove(`${element.classList[0]}--${state}`);

const elementHasClassName = (element, className) => element.classList.contains(className);
const elementHasState = (element, state) => element.classList.contains(`${element.classList[0]}--${state}`);

const getElementAncestor = (element, ancestorIdentifier) => element.closest(ancestorIdentifier);
