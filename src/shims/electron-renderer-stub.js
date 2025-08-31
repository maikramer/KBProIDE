const ipcRenderer = {
  on() {},
  once() {},
  send() {},
  invoke() { return Promise.resolve(null); },
  removeListener() {},
  removeAllListeners() {},
};

const shell = {
  openExternal(url) {
    try { if (typeof window !== 'undefined' && url) { window.open(url, '_blank'); } } catch (e) {}
  },
};

module.exports = { ipcRenderer, shell };


