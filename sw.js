importScripts("shared.js");

function getCards() {
  return chrome.storage.sync.get({ cards: [] }).then(function (result) {
    return Array.isArray(result.cards) ? result.cards : [];
  });
}

function refreshBadge() {
  return getCards().then(function (cards) {
    if (cards.length === 0) {
      return chrome.action.setBadgeText({ text: "" });
    }

    var minimum = Math.min.apply(null, cards.map(function (card) {
      return daysUntil(nextClose(card.closeDay));
    }));

    return Promise.all([
      chrome.action.setBadgeText({ text: String(minimum) }),
      chrome.action.setBadgeBackgroundColor({
        color: minimum <= 3 ? "#c4622d" : "#1f6b4f"
      })
    ]);
  });
}

function icsLikeDate(date) {
  function pad(value) {
    return value < 10 ? "0" + value : String(value);
  }

  return date.getFullYear() + pad(date.getMonth() + 1) + pad(date.getDate());
}

function dailyCheck() {
  return getCards().then(function (cards) {
    var todayKey = icsLikeDate(new Date());
    var notifications = cards.filter(function (card) {
      return daysUntil(nextClose(card.closeDay)) === 3;
    }).map(function (card) {
      return chrome.notifications.create(
        "close-" + card.name + "-" + todayKey,
        {
          type: "basic",
          title: card.name + " closes in 3 days",
          message: "Pay the balance down now if you want a low number reported to the credit bureaus.",
          iconUrl: "icons/icon128.png"
        }
      );
    });

    return Promise.all([refreshBadge()].concat(notifications));
  });
}

function startDailyAlarm() {
  refreshBadge();
  chrome.alarms.create("daily", { periodInMinutes: 1440 });
}

chrome.runtime.onInstalled.addListener(startDailyAlarm);
chrome.runtime.onStartup.addListener(startDailyAlarm);

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === "daily") dailyCheck();
});

chrome.runtime.onMessage.addListener(function (message) {
  if (message && message.type === "refresh") refreshBadge();
});

chrome.storage.onChanged.addListener(function (changes, areaName) {
  if (areaName === "sync" && changes.cards) refreshBadge();
});
