var st = browser.storage.local

function send(id, s) {
  browser.tabs.sendMessage(id, { rot: s }).catch(() => {})
}

function rst(id) {
  st.get('rot').then(res => {
    var d = res.rot || {}
    d[id] = { s: 0, last: Date.now() }
    st.set({ rot: d })
    send(id, 0)
  })
}

browser.runtime.onInstalled.addListener(() => {
  st.get(['rot', 'hps']).then(res => {
    var patch = {}
    if (!res.rot) patch.rot = {}
    if (res.hps === undefined) patch.hps = 24
    if (Object.keys(patch).length) st.set(patch)
  })
  browser.alarms.create('tick', { periodInMinutes: 1 })
})

browser.runtime.onStartup.addListener(() => tk())

browser.alarms.onAlarm.addListener(a => {
  if (a.name === 'tick') tk()
})

browser.tabs.onActivated.addListener(i => { rst(i.tabId) })

browser.tabs.onCreated.addListener(t => {
  st.get('rot').then(res => {
    var d = res.rot || {}
    d[t.id] = { s: 0, last: Date.now() }
    st.set({ rot: d })
  })
  setTimeout(() => send(t.id, 0), 300)
})

browser.tabs.onUpdated.addListener((id, chg) => {
  if (chg.status !== 'complete') return
  st.get('rot').then(res => {
    var d = res.rot || {}
    if (!d[id]) return
    browser.tabs.sendMessage(id, { rot: d[id].s }).catch(() => {})
  })
})

browser.tabs.onRemoved.addListener(id => {
  st.get('rot').then(res => {
    var d = res.rot || {}
    delete d[id]
    st.set({ rot: d })
  })
})

browser.runtime.onMessage.addListener((msg, snd) => {
  if (msg.close_me && snd.tab) {
    var id = snd.tab.id
    browser.tabs.remove(id)
    st.get('rot').then(res => {
      var d = res.rot || {}
      delete d[id]
      st.set({ rot: d })
    })
  }
})

function tk() {
  st.get(['rot', 'hps']).then(res => {
    var d = res.rot || {}
    var hps = res.hps || 24
    var now = Date.now()
    var msPerStage = hps * 3600000

    browser.tabs.query({}).then(tabs => {
      var kl = []

      for (var i = 0; i < tabs.length; i++) {
        var t = tabs[i]
        if (!d[t.id]) {
          d[t.id] = { s: 0, last: now }
          send(t.id, 0)
          continue
        }
        var raw = Math.floor((now - d[t.id].last) / msPerStage)
        var ns = raw < 5 ? raw : 5

        if (raw >= 6) {
          kl.push(t.id)
        } else if (d[t.id].s !== ns) {
          d[t.id].s = ns
          send(t.id, ns)
        }
      }

      for (var j = 0; j < kl.length; j++) {
        browser.tabs.remove(kl[j])
        delete d[kl[j]]
      }
      st.set({ rot: d })
    })
  })
}
