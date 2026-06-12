(function () {
  "use strict";

  var listEl = document.getElementById("card-list");
  var emptyEl = document.getElementById("empty-state");
  var formEl = document.getElementById("add-form");
  var nameEl = document.getElementById("card-name");
  var dayEl = document.getElementById("close-day");
  var errorEl = document.getElementById("form-error");
  var cards = [];

  function ordinal(day) {
    var mod100 = day % 100;
    if (mod100 >= 11 && mod100 <= 13) return day + "th";
    if (day % 10 === 1) return day + "st";
    if (day % 10 === 2) return day + "nd";
    if (day % 10 === 3) return day + "rd";
    return day + "th";
  }

  function saveCards() {
    return chrome.storage.sync.set({ cards: cards });
  }

  function requestRefresh() {
    chrome.runtime.sendMessage({ type: "refresh" });
  }

  function removeCard(index) {
    cards.splice(index, 1);
    saveCards().then(function () {
      render();
      requestRefresh();
    });
  }

  function createCardRow(card, index) {
    var remaining = daysUntil(nextClose(card.closeDay));
    var row = document.createElement("div");
    var copy = document.createElement("div");
    var name = document.createElement("div");
    var date = document.createElement("div");
    var badge = document.createElement("span");
    var remove = document.createElement("button");

    row.className = "card-row";
    copy.className = "card-copy";
    name.className = "card-name";
    date.className = "card-date";
    badge.className = "badge" + (remaining <= 3 ? " soon" : "");
    remove.className = "remove";

    name.textContent = card.name;
    date.textContent = "closes the " + ordinal(card.closeDay);
    badge.textContent = remaining + "d";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", "Remove " + card.name);
    remove.addEventListener("click", function () {
      removeCard(index);
    });

    copy.appendChild(name);
    copy.appendChild(date);
    row.appendChild(copy);
    row.appendChild(badge);
    row.appendChild(remove);
    return row;
  }

  function render() {
    listEl.replaceChildren();
    emptyEl.hidden = cards.length > 0;
    cards.forEach(function (card, index) {
      listEl.appendChild(createCardRow(card, index));
    });
  }

  formEl.addEventListener("submit", function (event) {
    event.preventDefault();

    var name = nameEl.value.trim();
    var day = Number(dayEl.value);

    if (!name || !Number.isInteger(day) || day < 1 || day > 31) {
      errorEl.textContent = "Enter a card name and a closing day from 1 to 31.";
      return;
    }

    errorEl.textContent = "";
    cards.push({ name: name, closeDay: day });
    saveCards().then(function () {
      formEl.reset();
      nameEl.focus();
      render();
      requestRefresh();
    });
  });

  chrome.storage.sync.get({ cards: [] }).then(function (result) {
    cards = Array.isArray(result.cards) ? result.cards : [];
    render();
  });
})();
