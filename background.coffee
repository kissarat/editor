api = chrome.app
store = chrome.storage.sync
win = null

defaultConfig =
	FileSystemSize: 50 * 1024 * 1024
	Noob: false
	window:
		minWidth: 640
		minHeight: 480

store.get (Object.keys defaultConfig), (o)->
  for k,v of o
    delete defaultConfig[k]
  for k,v of defaultConfig
    store.set defaultConfig
    break
  main o

main = (config) ->
	api.runtime.onLaunched.addListener ->
		api.window.create "window.html", config.window,
				(w) -> win = w