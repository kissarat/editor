(function() {

function makeFrozen(functions, properties) {
	var members = functions;
	for (var name in functions) if (functions.hasOwnProperty(name)) {
		members[name] = {
			value: members[name],
			writable: false,
			configurable: false,
			enumerable: false
		}
	}

	if (properties)
	for (var name in members) if (properties.hasOwnProperty(name)) {
		var property = properties[name];
		if (property instanceof Function) property = { get: property };
		if (property instanceof String) property = {
			get: eval('(function(){return this.' + property + '})'),
			set: eval('(function(v){return this.' + property + '=v})')
		};
		property.configurable = false;
		property.enumerable = false;
		members[name] = property;
	}
	return members;
}

Object.defineProperties(Object.prototype, makeFrozen({
	extendFrozenMembers: function() {
		Object.defineProperties(
			this.prototype,
			makeFrozen.apply(this, arguments));
	},

	forMembers: function(callback) {
		for (var key in this)
			callback(this[key], key);
	},

	forOwn: function(callback) {
		for (var key in this)
			if (this.hasOwnProperty(key))
				callback(this[key], key);
	},

	forTypical: function(obj, callback) {
		// Function may have arguments (obj, iterateAllMembers, callback)
		var iterateOwn = false;
		if (3 == arguments.length) {
			iterateOwn = !callback;
			callback = arguments[2];
		}

		for(var key in this) {
			var value = this[key];
			if (value instanceof obj && iterateOwn && this.hasOwnProperty(key))
				callback(value, key);
		}
	}
},{
	base: '__proto__.__proto__'
}));

Element.extendFrozenMembers({
	addChild: function(name, content) {
		var child = document.createElement(name);
		if (content)
			if ('string' == typeof content)
				if(child instanceof HTMLInputElement || child instanceof HTMLTextAreaElement)
					child.setAttribute('value', content);
				else
					child.innerHTML = content;
			else if (content instanceof Node)
				child.appendChild(content);
			else throw Error('Unsupported type of child content');

		this.appendChild(child);
		return child;
	},

	addChildren: function(quantity, name, attributes) {
		for(var i=0; i<quantity; i++) {
			var child = this.addChild(name);
			if (attributes) attributes.forOwn(function(value, key) {
				child[key] = value;
			});
		}
	}

/*	forChildElements: function(callback) {
		this.forChildNodes(NodeFilter.SHOW_ELEMENT, callback);
	},

	forChildNodes: function(type, callback) {
		if (type instanceof Function) {
			callback = type;
			type = NodeFilter.SHOW_ALL;
		}
		var iter = document.createNodeIterator(this, type);
		for (var element; element = iter.nextNode();)
			callback();
	},

	createChildArray: function(type) {
		if (!type)
			type = NodeFilter.SHOW_ALL;
		var result = [];
		this.forChildNodes(type, result.push.bind(result))
		return result;
	}*/

},{
//	childElements: function() {
//		return createChildArray(NodeFilter.SHOW_ELEMENT);
//	}
});

NodeList.extendFrozenMembers({
	forEach: function(callback) {
		for(var i=0; i<this.length; i++)
			callback(this.item(i), i);
	},

	every: function(type, callback) {
		for(var i=0; i<this.length; i++)
			if (this.item(i) instanceof type)
				callback(this.item(i), i);
	}
});

this.first = document.querySelector.bind(document);
this.all = function(selector, callback) {
	if (callback instanceof Function)
		document.querySelectorAll(selector).forEach(callback);
	else
		return document.querySelectorAll(selector);
	return null;
};

this.any = function(selector, test) {
	var nodes = document.querySelectorAll(selector);
	for(var i=0; i<nodes.length; i++)
		if(test(nodes[i], i))
			return nodes[i];
	return null;
};

function html_escape(raw) {
	return raw.replace(/[<>&\/"']/, function(c) {
		switch (c) {
			case '<': return '&gt';
			case '>': return '&lt';
			case '&': return '&amp';
			case '/': return '&#47';
			case '"': return '&quot';
			case "'": return '&apos';
		}
		throw new Error('Character cannot be escaped ' + c);
	});
}

HTMLFormElement.extendFrozenMembers({
	save: function(o) {
		if (!o) o = new Object();
		this.querySelectorAll('[name]').forEach(function(input) {
			var value;
			if (input instanceof HTMLInputElement)
				//if ((['date', 'time', 'datetime', 'datetime-local', 'month', 'week'])
				//	.indexOf(input.type) >= 0)
					value = input.value;
			else
				value = input.innerHTML;
			o[input.getAttribute('name')] = value;
		});
		return o;
	},

	load: function(o) {
		this.querySelectorAll('[name]').forEach(function(input) {
			if (input instanceof HTMLInputElement)
				o.value = o[input.name];
			else
				o.innerHTML = o[input.name];
		});
	},

	update: function(key, value) {
		var input = this.querySelector('[name=' + key + ']');
		if (input instanceof HTMLInputElement)
			input.value = value;
		else
			input.innerHTML = value;
	}
});

HTMLTableElement.extendFrozenMembers({
	insertSimilarRow: function(p) {
		var dst, src;
		/*if ('number' == p) {
			src = this.rows.item(p);
			dst = this.insertRow(p);
		} else */ if (p instanceof HTMLTableCellElement) {
			src = p.parentElement();
			dst = this.insertRow(src.rowIndex);
		} else
			throw new Error('Invalid argument');
		for(var i=0; i<src.cells.length; i++) {
			var cell = src.cells.item(i).cloneNode(false);
			dst.appendChild(cell);
		}
	},

	insertSimilarColumn: function(p) {
		for(var i=0; i<this.rows.length; i++) {
			var row = this.rows.item(i);
			var cell;
			for (var j=0; j<p; j += cell.colSpan)
				cell = row.cells.item(j);
			row.insertBefore(cell.cloneNode(false), cell);
		}
	}
});

this.getCursorNode = function() {
	return getSelection().anchorNode;
}

}).bind(window)();