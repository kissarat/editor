function Storage(name, version) {
	var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
	var db_request = indexedDB.open(name, version);
	db_request.onsuccess = function() {
		var db = db_request.result;
		var doc_id = 0;
		this.pass('doc', function(doc) {
			if (doc_id > doc.id)
				doc_id = doc.id;
		});
		this.doc_id = doc_id;
		after_db();
	};
	db_request.onupgradeneeded = function(e) {
		var db = e.target.result;
		var docStore = db.createObjectStore('doc', { keyPath: 'id', autoIncrement: true });
		docStore.createIndex('id', 'id');
		docStore.createIndex('last_read', 'last_read');
		docStore.createIndex('last_write', 'last_write');
		this.db = db;
		this.docStore = docStore;
	};
	db_request.onerror = report.error;
}

Storage.prototype = {
	pass: function() {
		var db_request = arguments[0];
		var callback = arguments[arguments.length - 1];
		if (typeof arguments[0] == 'string') {
			var store = getReadStore(arguments[0]);
			var key = typeof 'string' == arguments[1] ? arguments[1] : 'id';
			db_request = store.index(key).openCursor();
		}
		db_request.onsuccess = function (e) {
			var cursor = e.target.result;
			if (cursor) {
				var key_request = db_request.source.get(cursor.key);
				key_request.onsuccess = function(e) {
					callback(e.target.result);
					cursor.continue();
				}
			}
		};
		db_request.onerror = report.error;
	},

	createDoc: function() {
		var now = Date.now();
		return {
			last_read: now,
			last_write: now
		}
	},

	getStore: function(name) {
		return db.transaction(name, 'readwrite').objectStore(name);
	},

	getReadStore: function(name) {
		return db.transaction(name, 'readonly').objectStore(name);
	},

	saveDoc: function(e) {
		if (e instanceof Event) {
			e.preventDefault();
			e = e.target;
		}
		var form = document.getElementById('doc');
		var obj = form.save();
		var store = this.getStore(store);
		if (obj.id)
			store.put(doc, doc.id);
		else {
			doc.id = --doc_id;
			store.add(doc);
			test_data();
		}
	},

	loadDoc: function() {
		if (id instanceof Event)
			id = this.doc_id;
		var store = getReadStore('doc');
		var db_request = store.get(id);
		db_request.onsuccess = function() {
			db_request.result.mapAttributes(set_attribute);
		}
	}
};

function gen_string(length)
{
    if (!length)
        length = 5;
    var text = "";
    var possible = "AB CD EFGHIJKLMNO PQRSTUVWXYZ abcdefg hijklmnopqr stuvwx yz012 34 56789";
    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function test_data() {
    document.getElementById('number').value = Math.ceil(Math.random()*2);
    document.getElementById('number').value = Math.floor(Math.random()*10);
    document.getElementById('title').value = gen_string(10);
    document.getElementById('summary').value = gen_string(50);
}