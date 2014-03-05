byId = document.getElementById.bind document
errorDiv = null
content = null
fs = null

addEventListener 'load', ->
	errorDiv = byId 'error'
	content = byId 'content'
	chrome.storage.sync.get ['FileSystemSize', 'Noob'], main


report = (message) ->
  if message instanceof Event
    message = message.message
  errorDiv.innerHTML = message
  errorDiv.classList.add 'visible'

async = () ->
	args = arguments.slice 1
	args.push report
	this[arguments[0]].apply this, args


main = (config) ->
	async 'webkitRequestFileSystem', PERSISTENT, config.FileSystemSize,
		(fileSystem) ->
			fs = fileSystem
	#main = Function

getSelectedCell = () ->
  cells = document.querySelectorAll '#construct td'
  for cell in cells
    if '#BBBBBB' == cell.style.background
      return cell

getSelectedColumnIndex = () ->
  cell = getSelectedCell()
  i = 0
  row = cell.parentNode
  for curCell in row.cells
    if curCell == cell
      break
    i++
  i

table_tools =
  insertRow:
    hint: 'Вставити рядок'
    onclick: () ->
      newRow = document.createElement 'tr'
      row = getSelectedCell().parentNode
      for cell in row.cells
        newRow.appendChild cell.clone false
      this.tBodies[0].insertBefore newRow

  insertColumn:
    hint: 'Вставити стовбець'
    onclick: () ->
      i = getSelectedColumnIndex()
      for row in this.rows
        cell = row.cells.item i
        newCell = document.createElement 'td'
        row.insertBefore newCell, cell

  removeRow:
    hint: 'Видалити рядок'
    onclick: () ->
      this.tBodies[0].removeChild (getSelectedCell()).parentNode

  removeColumn:
    hint: 'Видалити стовбець'
    onclick: () ->
      i = getSelectedColumnIndex()
      for row in this.rows
        cell = row.cells.item i
        row.removeChild cell
