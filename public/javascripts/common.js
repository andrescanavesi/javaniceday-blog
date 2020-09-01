/**
 * Usit as: onkeyup="search(event, this)"
 * @param {*} event
 * @param {*} element
 */
function search(event, element) {
  if (event.keyCode === 13) {
    // listen to 'enter' key
    const phrase = element.value;
    if (phrase.length > 0) {
      window.location.href = `/search?q=${phrase}`;
    } else {
      window.location.href = '/';
    }
  }
}

function toggleNavbar() {
  const element = document.getElementById('navbarSupportedContent');
  element.classList.toggle('show');
}
