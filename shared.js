// Next occurrence of a day-of-month (1-31), clamped to month length, >= today.
function nextClose(closeDay) {
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var y = today.getFullYear(), m = today.getMonth();
  function clamp(y, m, d) {
    var last = new Date(y, m + 1, 0).getDate();
    return new Date(y, m, Math.min(d, last));
  }
  var d = clamp(y, m, closeDay);
  if (d < today) d = clamp(y, m + 1, closeDay);
  return d;
}

function daysUntil(date) {
  var today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.round((date - today) / 86400000);
}
