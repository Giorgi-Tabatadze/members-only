const first = document.getElementById("first");
const second = document.getElementById("second");
const third = document.getElementById("third");
const fourth = document.getElementById("fourth");

/// Check if input is max length and jump to next one if it is
function maxLengthAndJump(e) {
  if (e.target.value.length > e.target.maxLength) {
    e.target.value = e.target.value.charAt(0);
  }
  if (e.target.value.length === e.target.maxLength) {
    if (e.target?.parentElement?.nextSibling?.firstElementChild)
      e.target.parentElement.nextSibling.firstElementChild.focus();
  }
}

/// Check if user is deliting and input has nothing in it and jump back if it doesnt
function jumpBackOnDelete(e) {
  if (e.key === "Backspace" && e.target.value.length === 0) {
    if (e.target?.parentElement?.previousSibling?.firstElementChild) {
      e.target.parentElement.previousSibling.firstElementChild.focus();
    }
  }
}

first.addEventListener("input", maxLengthAndJump);
second.addEventListener("input", maxLengthAndJump);
third.addEventListener("input", maxLengthAndJump);
fourth.addEventListener("input", maxLengthAndJump);

first.addEventListener("keyup", jumpBackOnDelete);
second.addEventListener("keyup", jumpBackOnDelete);
third.addEventListener("keyup", jumpBackOnDelete);
fourth.addEventListener("keyup", jumpBackOnDelete);
