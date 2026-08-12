var orig_fav  = null;
var orig_ttl  = '';
var blink_iv  = null;
var saved     = false;

function save_orig() {
  if (saved) return;
  var lnk  = document.querySelector("link[rel*='icon']");
  orig_fav = lnk ? lnk.href : '';
  orig_ttl = document.title;
  saved    = true;
}