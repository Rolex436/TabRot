var prev_s = -1
var blink_iv = null
var fav_iv = null
var restore_iv = null
var orig_fav = ''
var orig_ttl = ''
var fav_saved = false
var fav_img = null

var _c = null
var _ctx = null
function getCtx() {
  if (!_c) {
    _c = document.createElement('canvas')
    _c.width = _c.height = 32
    _ctx = _c.getContext('2d')
  }
  return _ctx
}

function save_orig() {
  if (fav_saved) return
  var lnk = document.querySelector("link[rel*='icon']")
  orig_fav = lnk ? lnk.href : ''
  orig_ttl = document.title
  fav_saved = true
  if (orig_fav) {
    var img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = function() { fav_img = img }
    img.onerror = function() { fav_img = null }
    img.src = orig_fav
  }
}

function set_fav(url) {
  var lnk = document.querySelector("link[rel*='icon']")
  if (!lnk) {
    lnk = document.createElement('link')
    lnk.rel = 'icon'
    document.head.appendChild(lnk)
  }
  lnk.href = url
}

function clr_fav_iv() { if (fav_iv) { clearInterval(fav_iv); fav_iv = null } }
function clr_blink() { if (blink_iv) { clearInterval(blink_iv); blink_iv = null } }
function clr_restore() { if (restore_iv) { clearInterval(restore_iv); restore_iv = null } }

function mk_deg_fav(s) {
  var ct = getCtx()

  var base_clr = ['', '#555', '#333', '#7a6820', '#6a3808']
  if (fav_img) {
    try { ct.drawImage(fav_img, 0, 0, 32, 32) }
    catch (e) { ct.fillStyle = base_clr[s] || '#333'; ct.fillRect(0, 0, 32, 32) }
  } else {
    ct.fillStyle = base_clr[s] || '#333'
    ct.fillRect(0, 0, 32, 32)
  }

  var sep = [0, 0, 0, 0.5, 0.9][s] || 0
  if (sep > 0 && fav_img) {
    try {
      var id = ct.getImageData(0, 0, 32, 32)
      var d = id.data
      for (var i = 0; i < d.length; i += 4) {
        var r = d[i], g = d[i+1], b = d[i+2]
        d[i]   = r + (Math.min(255, r*0.393 + g*0.769 + b*0.189) - r) * sep
        d[i+1] = g + (Math.min(255, r*0.349 + g*0.686 + b*0.168) - g) * sep
        d[i+2] = b + (Math.min(255, r*0.272 + g*0.534 + b*0.131) - b) * sep
      }
      ct.putImageData(id, 0, 0)
    } catch (e) {}
  }

  var gd = [0, 0.2, 0.48, 0.18, 0.28][s] || 0
  if (gd > 0) {
    var id2 = ct.getImageData(0, 0, 32, 32)
    var d2 = id2.data
    for (var j = 0; j < d2.length; j += 4) {
      if (Math.random() < gd) {
        var v = Math.random() > 0.5 ? 230 : 10
        d2[j] = d2[j+1] = d2[j+2] = v
        d2[j+3] = 210
      }
    }
    ct.putImageData(id2, 0, 0)
  }

  var fo = [0, 0, 0, 0.22, 0.5][s] || 0
  if (fo > 0) {
    ct.fillStyle = 'rgba(255,240,180,' + fo + ')'
    ct.fillRect(0, 0, 32, 32)
  }

  return _c.toDataURL()
}

function start_fav_anim(s) {
  clr_fav_iv()
  set_fav(mk_deg_fav(s))
  fav_iv = setInterval(function() { set_fav(mk_deg_fav(s)) }, 500)
}

function mk_restore_frame(t) {
  var ct = getCtx()

  if (fav_img) {
    try { ct.drawImage(fav_img, 0, 0, 32, 32) }
    catch (e) { ct.fillStyle = '#8a8a8a'; ct.fillRect(0, 0, 32, 32) }
  } else {
    ct.fillStyle = '#8a8a8a'
    ct.fillRect(0, 0, 32, 32)
  }

  var pulse = Math.sin(t * Math.PI * 3) * 0.5 + 0.5
  var alpha = pulse * (1 - t) * 0.6
  if (alpha > 0.02) {
    ct.fillStyle = 'rgba(255,220,140,' + alpha.toFixed(3) + ')'
    ct.fillRect(0, 0, 32, 32)
  }

  return _c.toDataURL()
}

function restore_anim(done) {
  clr_fav_iv()
  clr_restore()
  var start = Date.now()
  var dur = 650

  document.title = '\u2728 ' + orig_ttl

  restore_iv = setInterval(function() {
    var t = (Date.now() - start) / dur
    if (t >= 1) {
      clr_restore()
      done()
      return
    }
    set_fav(mk_restore_frame(t))
  }, 50)
}

var ttl_pfx = ['', '\uD83D\uDFE1 ', '\uD83D\uDFE0 ', '\uD83D\uDD34 ', '\uD83D\uDD34\uD83D\uDD34 ']

function apply(s) {
  save_orig()
  clr_blink()
  clr_fav_iv()

  if (s === 0) {
    if (prev_s > 0) {
      restore_anim(function() {
        if (orig_fav) set_fav(orig_fav)
        document.title = orig_ttl
      })
    } else {
      clr_restore()
      if (orig_fav) set_fav(orig_fav)
      document.title = orig_ttl
    }
  } else if (s <= 4) {
    clr_restore()
    start_fav_anim(s)
    document.title = ttl_pfx[s] + orig_ttl
  } else {
    clr_restore()
    var tog = true
    var ct = getCtx()
    blink_iv = setInterval(function() {
      ct.fillStyle = tog ? '#cc0000' : '#000000'
      ct.fillRect(0, 0, 32, 32)
      set_fav(_c.toDataURL())
      document.title = tog ? '\uD83D\uDD34 ' + orig_ttl : '\u2B1B dying...'
      tog = !tog
    }, 400)

    setTimeout(function() {
      clr_blink()
      browser.runtime.sendMessage({ close_me: true })
    }, 10000)
  }

  prev_s = s
}

browser.runtime.onMessage.addListener(function(msg) {
  if (msg.rot !== undefined) apply(msg.rot)
})

