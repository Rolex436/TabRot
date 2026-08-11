var st = chrome.storage.local;

var grp_clr = ['', 'yellow', 'orange', 'red'];

hrome.runtime.onInstalled.addListener(function() {
  st.set({ rot: {}, mps: 30 });
  chrome.alarms.create('tick', { periodInMinutes: 30 });
});

chrome.alarms.onAlarm.addListener(function(a) {
  if (a.name === 'tick') tick();
});

chrome.tabs.onActivated.addListener(function(info) {
  rst(info.tabId);
});

chrome.tabs.onCreated.addListener(function(t) {
  rst(t.id);
});

chrome.tabs.onRemoved.addListener(function(id) {
  st.get('rot', function(res) {
    var rd = res.rot || {};
    delete rd[id];
    st.set({ rot: rd });
  });
});