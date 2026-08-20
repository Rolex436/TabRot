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



function open_t(id, row) {
  browser.tabs.update(id, { active:true });
  st.get('rot').then(function(res) {
    var rd = res.rot||{};
    rd[id] = { s:0, last:Date.now() };
    st.set({ rot:rd });
  });
  send(id, 0);
  upd_row(row, 0);
  var dbg_row = document.querySelector('.dbg-row[data-id="'+id+'"]');
  if(dbg_row) set_sw_active(dbg_row, 0);
}



function set_dbg_ui(on) {
  document.getElementById('dbg-panel').classList.toggle('vis', on);
  var btn = document.getElementById('dbg-btn');
  btn.classList.toggle('on', on);
  document.getElementById('dbg-st').textContent = on ? 'on' : 'off';
}

async function render_dbg(tabs, rd, hps) {
  var list = document.getElementById('dbg-list');
  list.innerHTML = '';
  tabs.forEach(function(t) {
    var cur  = rd[t.id] ? rd[t.id].s : 0;
    var drow = document.createElement('div');
    drow.className  = 'dbg-row';
    drow.dataset.id = t.id;

    var nm = document.createElement('span');
    nm.className   = 'dbg-nm';
    nm.textContent = (t.title||'untitled').slice(0,30);

    var sws = mk_sws(t.id, cur, hps);
    drow.appendChild(nm);
    drow.appendChild(sws);
    list.appendChild(drow);
  });
}

function mk_sws(id, cur, hps) {
  var wrap = document.createElement('div');
  wrap.className = 'sws';

  [0,1,2,3,4,5].forEach(function(lvl) {
    var sw = document.createElement('button');
    sw.className = 'sw sw-'+lvl+(cur===lvl?' on':'');
    sw.title = stage_lbl(lvl);

    sw.addEventListener('click', function() {
      set_rot(id, lvl, hps);
      send(id, lvl);
      set_sw_active(wrap.parentElement, lvl);
      var main = document.querySelector('.row[data-id="'+id+'"]');
      if(main) {
        upd_row(main, lvl);
        if(lvl >= 5) {
          requestAnimationFrame(function() {
            requestAnimationFrame(function() { die(main, id); });
          });
        }
      }
    });

    wrap.appendChild(sw);
  });
  return wrap;
}

function set_sw_active(dbg_row, lvl) {
  if(!dbg_row) return;
  dbg_row.querySelectorAll('.sw').forEach(function(b, i) {
    b.classList.toggle('on', i===lvl);
  });
}



function set_rot(id, lvl, hps) {
  st.get('rot').then(function(res) {
    var rd        = res.rot||{};
    var fake_last = Date.now()-(lvl*hps*3600*1000);
    rd[id]        = { s:lvl, last:fake_last };
    st.set({ rot:rd });
  });
}

function send(id, s) {
  browser.tabs.sendMessage(id, { rot:s }).catch(function(){});
}



function die(row, id) {
  row.classList.add('dying');
  row.addEventListener('animationend', function() {
    browser.tabs.remove(id);
    st.get('rot').then(function(res) {
      var rd=res.rot||{};
      delete rd[id];
      st.set({ rot:rd });
    });
    row.remove();
    var left = document.querySelectorAll('.row').length;
    document.getElementById('cnt').textContent = left+' tabs';
  }, { once:true });
}



function mk_presets(hps) {
  document.querySelectorAll('.pre').forEach(function(btn) {
    var h = parseInt(btn.dataset.h);
    btn.classList.toggle('on', h===hps);
    btn.addEventListener('click', function() {
      st.set({ hps:h });
      browser.alarms.create('tick', { periodInMinutes:Math.min(h*60, 60) });
      document.querySelectorAll('.pre').forEach(function(b) { b.classList.remove('on'); });
      btn.classList.add('on');
    });
  });
}



document.getElementById('dbg-btn').addEventListener('click', async function() {
  var res = await st.get(['dbg','rot','hps']);
  var nxt = !res.dbg;
  st.set({ dbg:nxt });
  set_dbg_ui(nxt);
  if(nxt) {
    var tabs = await browser.tabs.query({});
    render_dbg(tabs, res.rot||{}, res.hps||24);
  } else {
    document.getElementById('dbg-list').innerHTML = '';
  }
});

init();


