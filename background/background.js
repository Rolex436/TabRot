var st = browser.storage.local;

browser.runtime.onInstalled.addListener(() => {
  st.set({ rot:{}, hps:24 });
  browser.alarms.create('tick', { periodInMinutes:1 });
});

browser.runtime.onStartup.addListener(() => { tk(); });

browser.alarms.onAlarm.addListener(a => { if(a.name==='tick') tk(); });

browser.tabs.onActivated.addListener(i => { rst(i.tabId); });

browser.tabs.onCreated.addListener(t => {
  st.get('rot').then(res => {
    var d = res.rot||{};
    d[t.id] = { s:0, last:Date.now() };
    st.set({ rot:d });
  });
  setTimeout(() => send(t.id, 0), 300);
});

browser.tabs.onUpdated.addListener((id, chg) => {
  if(chg.status !== 'complete') return;
  st.get('rot').then(res => {
    var d = res.rot||{};
    if(!d[id]) return;
    browser.tabs.sendMessage(id, { rot:d[id].s }).catch(()=>{});
  });
});

browser.tabs.onRemoved.addListener(id => {
  st.get('rot').then(res => { var d=res.rot||{}; delete d[id]; st.set({ rot:d }); });
});

browser.runtime.onMessage.addListener((msg, snd) => {
  if(msg.close_me && snd.tab) {
    var id = snd.tab.id;
    browser.tabs.remove(id);
    st.get('rot').then(res => { var d=res.rot||{}; delete d[id]; st.set({ rot:d }); });
  }
});

function rst(id) {
  st.get('rot').then(res => {
    var d = res.rot||{};
    d[id] = { s:0, last:Date.now() };
    st.set({ rot:d });
    send(id, 0);
  });
}

function send(id, s) {
  browser.tabs.sendMessage(id, { rot:s }).catch(()=>{});
}