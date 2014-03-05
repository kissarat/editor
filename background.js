// Generated by CoffeeScript 1.6.3
var api, defaultConfig, main, store, win;

api = chrome.app;

store = chrome.storage.sync;

win = null;

defaultConfig = {
  FileSystemSize: 50 * 1024 * 1024,
  Noob: false,
  window: {
    minWidth: 640,
    minHeight: 480
  }
};

store.get(Object.keys(defaultConfig), function(o) {
  var k, v;
  for (k in o) {
    v = o[k];
    delete defaultConfig[k];
  }
  for (k in defaultConfig) {
    v = defaultConfig[k];
    store.set(defaultConfig);
    break;
  }
  return main(o);
});

main = function(config) {
  return api.runtime.onLaunched.addListener(function() {
    return api.window.create("window.html", config.window, function(w) {
      return win = w;
    });
  });
};