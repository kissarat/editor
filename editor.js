var tableWindow,
    imageWindow;

function Toolbar(element, target) {
	if (!element) {
        element = document.createElement('div');
        target.parentElement.insertBefore(element, target);
	}
    element.classList.add('toolbar');
	this.element = element;
	this.target = target;
}

Toolbar.prototype = {
	add: function(name, tool) {
		var button = document.createElement('img')
		button.onclick = tool.onclick
			? tool.onclick
			: document.execCommand.bind(document, name);
        button.setAttribute('title', tool.hint);
        button.setAttribute('src', 'icon/' + name + '.svg');
        this.element.appendChild(button);
	},

	addMany: function(tools) {
		for (var name in tools)
        if (tools.hasOwnProperty(name)) {
            var tool = tools[name];
            this.add(name, tool);
        }
	}
};

function Window(name) {
    this.element = document.getElementById(name + 'Window');
	var header = this.element.addChild('div');
	var windowButtons = header.addChild('div');
	windowButtons.classList.add('windowButtons');
	windowButtons.appendChild(createButton('close', this.close.bind(this)));
	this.toolbar = new Toolbar(header.addChild('div'));
}

Window.prototype = {
	obscuredLayer : document.getElementById('obscuredLayer'),
	mainLayer: document.getElementById('mainLayer'),
	submit: Function,

    open: function() {
	    var toolbar = this.toolbar;
		toolbar.element.childNodes.every(HTMLImageElement, function(element) {
		    if (element.onclick)
			    element.onclick = element.onclick.bind(toolbar.target);
		});
		this.element.style.display = 'block';
		this.obscuredLayer.style.display = 'block';
    },

    close: function() {
        this.element.style.display = 'none';
		this.obscuredLayer.style.display = 'none';
    }
};

function TableWindow() {
	this.base = new Window('table');
	this.base.toolbar.addMany(table_tools);
}

function getSelected(callback, e) {
	callback(getSelection().anchorNode);
}

TableWindow.prototype = {
	open: function() {
		if (!this.base.toolbar.target) {
			var table = this.base.element.addChild('table');
            table.setAttribute('id', 'construct')
			table.onclick = function(e) {
				e.srcElement.style.backgroundColor = '#BBBBBB';
			};
			//table.setAttribute('contentEditable', 'true');
			var n=0;
			for (var i=0; i<5; i++) {
				var row = document.createElement('tr');
				for (var j=0; j<5; j++) {
					var td = row.addChild('td', (n++).toString());
				}
				table.appendChild(row);
			}
			this.base.toolbar.target = table;
		}
		this.base.open();
		//document.execCommand('insertHTML', true, table.outerHTML);
	}
};

function createButton(name, onclick) {
	var button = document.createElement('img');
	button.setAttribute('src', 'icon/' + name + '.svg');
	button.onclick = onclick;
	if (this instanceof HTMLElement)
		this.appendChild(button);
	else
		return button;
	return null;
}


function ImageWindow() {
    this.base = new Window('image');
    var holder = document.getElementById('holder');
    holder.ondragover = function() { return false; }
    holder.ondragend = function() { return false; }
    holder.ondrop = function(e) {
        //e.preventDefault();
        var reader = new FileReader();
        reader.onload = function(readerEvent) {
            holder.style.background = 'url("' + readerEvent.target.result + '") no-repeat center';
        };
        reader.readAsDataURL(e.dataTransfer.files[0]);
        return false;
    }
}

ImageWindow.prototype = {
    open: function() {
        this.base.open();
    }
};

var editor_tools = {
    removeFormat: {
        hint: 'Скинути форматування'
    },
    bold: {
        hint: 'Жирний'
    },
    italic: {
        hint: 'Косий'
    },
    underline: {
        hint: 'Підкреслений'
    },
    justifyLeft: {
        hint: 'Вирівняти по лівому краю'
    },
    justifyCenter: {
        hint: 'Вирівняти по центру'
    },
    justifyRight: {
        hint: 'Вирівняти по правому краю'
    },
    justifyFull: {
        hint: 'Вирівняти по всій ширині'
    },
    indent: {
        hint: 'Збільшити відступ'
    },
    outdent: {
        hint: 'Зменшити відступ'
    },
    insertOrderedList: {
        hint: 'Нумерований список'
    },
    insertUnorderedList: {
        hint: 'Cписок'
    },
    insertImage: {
        hint: 'Вставити зображення',
        onclick: function() {
            if (!imageWindow)
                imageWindow = new ImageWindow();
            imageWindow.open();
        }
    },
	insertTable: {
		hint: 'Вставити таблицю',
		onclick: function() {
			if (!tableWindow)
				tableWindow = new TableWindow();
			tableWindow.open();
		}
	}
//   , code: {
//        hint: 'переглянути HTML код'
//        onclick: show_code
//    }
};
