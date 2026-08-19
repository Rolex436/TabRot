var prev_s    = -1;
var blink_iv  = null;
var fav_iv    = null;
var orig_fav  = '';
var orig_ttl  = '';
var fav_saved = false;
var fav_img   = null;

function save_orig() {
  if(fav_saved) return;
  var lnk  = document.querySelector("link[rel*='icon']");
  orig_fav = lnk ? lnk.href : '';
  orig_ttl = document.title;
  fav_saved = true;
  if(orig_fav) {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = function() { fav_img = img; };
    img.onerror = function() { fav_img = null; };
    img.src = orig_fav;
  }
}

function mk_deg_fav(s) {
  var c  = document.createElement('canvas');
  c.width = c.height = 32;
  var ct = c.getContext('2d');

  var base_clr = ['','#555','#333','#7a6820','#6a3808'];
  if(fav_img) {
    try { ct.drawImage(fav_img, 0, 0, 32, 32); }
    catch(e) { ct.fillStyle = base_clr[s]||'#333'; ct.fillRect(0,0,32,32); }
  } else {
    ct.fillStyle = base_clr[s]||'#333';
    ct.fillRect(0,0,32,32);
  }

  var sep = [0, 0, 0, 0.5, 0.9][s] || 0;
  if(sep > 0 && fav_img) {
    try {
      var id = ct.getImageData(0,0,32,32), d = id.data;
      for(var i = 0; i < d.length; i += 4) {
        var r=d[i],g=d[i+1],b=d[i+2];
        d[i]  = r+(Math.min(255,r*0.393+g*0.769+b*0.189)-r)*sep;
        d[i+1]= g+(Math.min(255,r*0.349+g*0.686+b*0.168)-g)*sep;
        d[i+2]= b+(Math.min(255,r*0.272+g*0.534+b*0.131)-b)*sep;
      }
      ct.putImageData(id, 0, 0);
    } catch(e) {}
  }}