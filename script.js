var st = browser.storage.local;
async function init() {
  var tabs = await browser.tabs.query({});
  var res  = await st.get(['rot', 'hps', 'dbg']);
  var rd   = res.rot || {};
  var hps  = res.hps  || 24;
  var dbg  = res.dbg  || false;

  document.getElementById('cnt').textContent = tabs.length + ' tabs';

  set_dbg_ui(dbg);
  mk_presets(hps);
  render_tabs(tabs, rd);
  if(dbg) render_dbg(tabs, rd, hps);
}



function render_tabs(tabs, rd) {
  var box = document.getElementById('tabs');
  box.innerHTML = '';
  tabs.forEach(function(t) {
    var s   = rd[t.id] ? rd[t.id].s : 0;
    var row = mk_row(t, s);
    box.appendChild(row);
    if(s >= 5) {
      requestAnimationFrame(function() {
        requestAnimationFrame(function() { die(row, t.id); });
      });
    }
  });
}

function mk_row(t, s) {
  var row = document.createElement('div');
  row.className  = 'row s' + s;
  row.dataset.id = t.id;
  row.dataset.s  = s;

  var ico = document.createElement('img');
  ico.className = 'ico';
  ico.src = t.favIconUrl || '';
  ico.onerror = function() { this.style.display = 'none'; };

  var nm = document.createElement('span');
  nm.className   = 'nm';
  nm.textContent = t.title || 'untitled';
  nm.addEventListener('click', function() { open_t(t.id, row); });

  var sg = document.createElement('span');
  sg.className   = 'sg';
  sg.textContent = stage_lbl(s);

  row.appendChild(ico);
  row.appendChild(nm);
  row.appendChild(sg);
  return row;
}

function stage_lbl(s) {
  return ['fresh','grain1','grain2','fade1','fade2','dying'][s] || 's'+s;
}

function upd_row(row, s) {
  var old = parseInt(row.dataset.s);
  if(old === s) return;
  row.classList.replace('s'+old, 's'+s);
  row.dataset.s = s;
  var sg = row.querySelector('.sg');
  if(sg) sg.textContent = stage_lbl(s);
}