const
	DB_NAME = 'medical',
	DB_VERSION = 1;
var
	content,
	db,
    submit,
	cat,
    fs,
    parser = new DOMParser();

img_id = 0;

function report(message, type) {
    console.log(message);
    return;
    if (message instanceof Event) {
        type = 'error';
        message = message.message;
    }
    var div = document.getElementsByClassName(type)[0];
    div.innerHTML = message;
    div.classList.add('visible');
}

report.info = function(message) {
    report(message, 'info');
};

report.warning = function(message) {
    report(message, 'warning');
};

report.error = function(message) {
    report(message, 'error');
};

window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

addEventListener('load', function() {
	content = first('#doc [name=content]');
	new Toolbar(null, content).addMany(editor_tools);
	windows_init();
    var imageFile = document.getElementById('imageFile');
    var img_name = (img_id++).toString();
    //fs.root.getFile(img_name, )
    imageFile.onchange = function(e) {
        var file = imageFile.files[0];
        console.log(file);
        fs.root.getFile(file.name, {create: true},
            function(fileEntry) {
                fileEntry.createWriter(function(writer) {
                    writer.onwriteend = function() {
                        console.log(arguments);
                        fileEntry.file(function(f) {
                            var reader = new FileReader();
                            reader.onload = addImage;
                            reader.readAsDataURL(f);
                        });
                    };
                    writer.onerror = report.error;
                    writer.write(file);
                });
            },
            report.error);
    };


//    requestFileSystem(TEMPORARY, 1024 * 1024,
//        function(ev) {
//            fs = ev;
//            console.log(ev);
//        },
//        report.error);



//	db = new Storage(DB_NAME, DB_VERSION);
//	test_data();
//	submit = document.querySelector('button[type=submit]');
//    submit.addEventListener('click', cat_init);
//    submit.addEventListener('click', save);
//    var newButton = document.getElementById('new');
//    newButton.addEventListener('click', function() {
//        document.forms[0].reset();
//        document.getElementById('id').value = null;
//    });

    content.addEventListener('paste', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var html = e.clipboardData.getData('text/html');
        //html = html.replace(/style=[\(\)\{\}\w\s\d\."':;,\-!]*/i, '');
        html = parser.parseFromString(html, 'text/html');
        var iter = html.createNodeIterator(html.body, NodeFilter.SHOW_ELEMENT);
        var element;
        while(element = iter.nextNode()) {
            var style = {};
            var properties = ['fontWeight', 'fontStyle', 'display'];
            properties.forEach(function(property) {
                style[property] = element.style[property];
            });
            element.removeAttribute('style');
            element.removeAttribute('class');
            properties.forEach(function(property) {
                element.style[property] = style[property];
            });
        }
//        document.execCommand('insertHTML', false, html);
        document.execCommand('insertHTML', false, html.body.innerHTML);
        return false;
    });
});

function addImage(readerEvent) {
    var figure = content.addChild('figure');
    var img_layer = figure.addChild('div');
    img_layer.className = 'img_layer';
    var img = figure.addChild('img');
    var range = img_layer.addChild('input');
    range.setAttribute('type', 'range');
    range.setAttribute('min', '0');
    range.setAttribute('max', '200');
    range.onchange = function() {
        var ratio = parseInt(range.value)/100;
        img.style.width = img.dataset.width * ratio + 'px';
        img.style.height = img.dataset.height * ratio + 'px';
    };
    img.setAttribute('src', readerEvent.target.result);
    var caption = figure.addChild('figcaption');
    caption.onclick = function(e) {
        var self = this;
        this.setAttribute('contentEditable', 'true');
        console.log(e);
        window.onkeypress = function(ev) {
            console.log(ev);
            if (13 == ev.keyCode) {
                self.setAttribute('contentEditable', 'false');
                window.onkeypress = null;
                return false;
            }
            return true;
        }
    };

    var imgStyle = getComputedStyle(img);
    img.dataset.width = parseInt(imgStyle.width);
    img.dataset.height = parseInt(imgStyle.height);
}

function after_db() {
    //cat_init();
}

function cat_init() {
	cat = document.getElementById('cat');
    cat.innerHTML = '';
    db.pass('doc', function(doc) {
        var div = document.createElement('li');
        div.innerHTML = doc.title;
        div.doc_id = doc.id;
        div.addEventListener('click', load);
        cat.appendChild(div);
    });
}

NodeList.prototype.forEach = function(action) {
	for(var i=0; i<this.length; i++)
		action(this.item(i));
};

var code_window_options = {
	minWidth: 320,
	minHeight: 480
};

function windows_init() {
    var windows = document.querySelectorAll('window');
    for (var i=0; i<windows.length; i++) {
        var window = windows.item(i);
        var header = document.createElement('div');
    }
}

function show_code(code) {
	if (code instanceof Event)
		code = code.target.editor.innerHTML;
	else if (code instanceof HTMLTextAreaElement)
		code = code.innerHTML;
	else if (!(code instanceof String))
		throw new Error("Invalid type of argument 'code'");
	chrome.app.window.create('code.html', code_window_options, function(w) {
		w.contentWindow.addEventListener('load', function(e) {
			e.target.getElementById('code').innerHTML = code;
		});
	});
}