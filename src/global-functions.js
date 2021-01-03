function showElement(element, className) {
  element.classList.remove(className + "--hidden");
}

function hideElement(element, className) {
  element.classList.add(className + "--hidden");
}
