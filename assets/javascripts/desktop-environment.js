$(document).ready(function() {
    filesystem.initialize();
    components.initialize();
    windows.initialize();
});

var filesystem = {
    instance: new VirtualFileSystem(),
    initialize: function() {
        filesystem.instance.mkdir('Documents');
        filesystem.instance.mkdir('Pictures');
        filesystem.instance.mkdir('Music');
        filesystem.instance.mkdir('Videos');
    },
    resolve_path: function(path) {
        return path === undefined ? filesystem.instance.pointer : filesystem.instance._resolve_path(path);
    },
    absolute_path: function(path) {
        return this.instance._absolute_path(path);
    }
};

var components = {
    initialize: function() {
        components.icons();
        components.textareas();
    },
    icons: function() {
        windows.desktop.on('mousedown', '.icon', function(e) {
            e.stopPropagation();
            if (e.ctrlKey) {
                $(this).toggleClass('highlighted');
            } else {
                $('.icon').removeClass('highlighted');
                $(this).addClass('highlighted');
            }
            var target = $(this).closest('.window');
            if (target.length) {
                windows.focus(windows.instance(target));
            }
        });

        windows.desktop.on('dblclick', '.icon[data-application]', function(e) {
            $(this).removeClass('highlighted');
            windows.spawn($(this).data('application'));
        });

        windows.desktop.on('mousedown', function(e) {
            $('.icon').removeClass('highlighted');
        });
    },
    textareas: function() {
        windows.desktop.on('keydown', 'textarea.autosize', function(e) {
            var target = windows.instance($(this).closest('.window'));
            if (e.keyCode === 9) {
                e.preventDefault();
            } else if (e.keyCode === 13) {
                e.preventDefault();
                target.execute();
            } else {
                target.autosize(e.keyCode);
            }
        });
    }
};

var windows = {
    desktop: $('#desktop'),
    instances: {},
    initialize: function() {
        windows.focus();
        windows.draggable();
        windows.actions();
    },
    spawn: function(application) {
        application = applications[application]();
        var key = $('.window').length;
        windows.instances[key] = application;
        application.dom.attr('data-instance', key);
        windows.desktop.append(application.dom);
        windows.focus(application);
    },
    focus: function(target) {
        if (target === undefined) {
            windows.desktop.on('mousedown', '.window', function(e) {
                windows.focus(windows.instance($(this)));
            });
        } else {
            $('.window').removeClass('focused');
            target.dom.addClass('focused');
            windows.desktop.append(target.dom);
            setTimeout(function() {
                target.focus();
            }, 0);
            filesystem.instance.cd(filesystem.instance._absolute_path(target.pointer));
        }
    },
    draggable: function() {
        var target = null;
        var start = { x: 0, y: 0 };
        var origin = { x: 0, y: 0 };

        windows.desktop.on('mousedown', '.window header', function(e) {
            target = $(this).closest('.window');
            start = { x: e.pageX, y: e.pageY };
            origin = { x: target.offset().left, y: target.offset().top };
        });

        windows.desktop.on('mousemove', function(e) {
            if (target !== null) {
                target.css({
                    top: origin.y + (e.pageY - start.y) + 'px',
                    left: origin.x + (e.pageX - start.x) + 'px'
                });
            }
        });

        windows.desktop.on('mouseup', function() {
            target = null;
            start = { x: 0, y: 0 };
            origin = { x: 0, y: 0 };
        });
    },
    close: function(target) {
        target.dom.remove();
        var last = windows.desktop.find('.window').last();
        if (last.length) {
            windows.focus(windows.instance(last));
        }
    },
    actions: function() {
        windows.desktop.on('mousedown', '.window .action', function(e) {
            e.stopPropagation();
            var target = windows.instance($(this).closest('.window'));
            windows.focus(target);
            if ($(this).hasClass('close')) {
                windows.close(target);
            } else if ($(this).hasClass('minimize')) {
                target.minimize();
            } else if ($(this).hasClass('maximize')) {
                target.maximize();
            }
        });
    },
    instance: function(target) {
        return windows.instances[target.data('instance')];
    }
};

var applications = {
    finder: function(path) {
        return new Finder(filesystem.resolve_path(path));
    },
    terminal: function(path) {
        return new Terminal(filesystem.resolve_path(path));
    },
    textedit: function(path) {
        return new TextEdit(filesystem.resolve_path(path));
    }
};

var templates = {
    finder: $('template#finder').html(),
    terminal: $('template#terminal').html(),
    textedit: $('template#textedit').html()
};

// WINDOW CLASSES
function Class() {}

Class.extend = function(child) {
    var instance = new this();
    for (var property in instance) {
        if (!child.prototype.hasOwnProperty(property)) {
            child.prototype[property] = instance[property];
        }
    }
    for (var property in this) {
        if (!child.hasOwnProperty(property)) {
            child[property] = this[property];
        }
    }
};

function Window() {}
Class.extend(Window);

Window.prototype.focus = function() {};

Window.prototype.minimize = function(callback) {
    if (this.dom.hasClass('maximized')) {
        this.dom.animate({
            top: this.dom.offset().top + (this.max_height - this.min_height) / 2 + 'px',
            left: this.dom.offset().left + (this.max_width - this.min_width) / 2 + 'px',
            width: this.min_width + 'px',
            height: this.min_height + 'px'
        }, 150, callback).removeClass('maximized');
    }
};

Window.prototype.maximize = function(callback) {
    if (!this.dom.hasClass('maximize')) {
        this.dom.animate({
            top: this.dom.offset().top - (this.max_height - this.min_height) / 2 + 'px',
            left: this.dom.offset().left - (this.max_width - this.min_width) / 2 + 'px',
            width: this.max_width + 'px',
            height: this.max_height + 'px'
        }, 150, callback).addClass('maximized');
    }
};

function Finder(pointer) {
    this.min_width = 700;
    this.min_height = 400;
    this.max_width = window.innerWidth - 100;
    this.max_height = window.innerHeight - 100;
    this.dom = $(templates.finder);
    this.pointer = pointer;
}
Window.extend(Finder);

Finder.prototype.maximize = function() {
    if (!this.dom.hasClass('maximize')) {
        this.dom.animate({
            top: 50 + 'px',
            left: 50 + 'px',
            width: this.max_width + 'px',
            height: this.max_height + 'px'
        }, 150).addClass('maximized');
    }
};

function Terminal(pointer) {
    this.min_width = 500;
    this.min_height = 300;
    this.max_width = 800;
    this.max_height = 500;
    this.dom = $(templates.terminal);
    this.prompt = this.dom.find('.prompt span');
    this.input = this.dom.find('textarea');
    this.pointer = pointer;
    var self = this;

    this.intercepts = {
        ls: function(path) {
            var results = filesystem.instance.ls(path);
            var width = 0;
            results.forEach(function(item) {
                width = Math.max(width, item.key.length);
            });
            width += 5;
            var columns = ~~(this.min_width / 7 / width);
            var line = '';
            for (var i = 0, j = columns; i < results.length; i++) {
                line += results[i].key;
                for (var k = 0; k < width - results[i].key.length; k++) {
                    line += '\u00a0';
                }
                if (--j == 0) {
                    this.log(line);
                    line = '';
                    j = columns;
                }
            }
            this.log(line);
        }
    };

    this.location(this.pointer);
}
Window.extend(Terminal);

Terminal.prototype.focus = function() {
    this.dom.find('textarea').focus();
};

Terminal.prototype.minimize = function() {
    var self = this;
    Window.prototype.minimize.call(self, function() {
        self.autosize();
    });
};

Terminal.prototype.maximize = function() {
    var self = this;
    Window.prototype.maximize.call(self, function() {
        self.autosize();
    });
};

Terminal.prototype.autosize = function(key) {
    var limit = Math.ceil(+(this.dom.find('main').width()) / 7) + 3;
    var length = this.input.val().length + this.prompt.text().length + 4;
    length -= key === 8 ? 1 : 0;
    this.input.height((~~(length / limit) + 1) * 12);
    if (this.dom.find('.contents').height() > this.dom.find('main').height()) {
        this.dom.find('.contents').addClass('overflow');
    } else {
        this.dom.find('.contents').removeClass('overflow');
    }
};

Terminal.prototype.log = function(message, color) {
    message = $('<p class="' + color + '">' + message + '</p>');
    this.input.parent().before(message);
    if (this.dom.find('.contents').height() > this.dom.find('main').height()) {
        this.dom.find('.contents').addClass('overflow');
    } else {
        this.dom.find('.contents').removeClass('overflow');
    }
};

Terminal.prototype.location = function(location) {
    var self = this;
    self.prompt.text(filesystem.instance._absolute_path(location));
    setTimeout(function() {
        self.input.css('text-indent', (self.prompt.width() / 7 + 1) * 7 - 0.5 + 'px');
    }, 0);
};

Terminal.prototype.execute = function() {
    var input = this.input.val();
    var command = input;
    var params = [];
    var index = command.indexOf(' ');
    if (index >= 0) {
        var buffer = '';
        var inside = false;
        for (var i = index + 1; i < input.length; i++) {
            var character = input.charAt(i);
            if (character === ' ' && !inside) {
                params.push(buffer.replace(/(^["']|["']$)/g, ''));
                buffer = '';
                continue;
            } else if (character === '"' || character === '\'') {
                inside = !inside;
            }
            buffer += character;
        }
        params.push(buffer.replace(/(^["']|["']$)/g, ''));
        command = input.substring(0, index);
    }
    this.log(this.prompt.text() + ' $ ' + input);
    this.input.val('');
    try {
        if (this.intercepts.hasOwnProperty(command)) {
            this.intercepts[command].apply(this, params);
        } else if (filesystem.instance.hasOwnProperty(command)) {
            filesystem.instance[command].apply(filesystem.instance, params);
        } else {
            throw new Error('Command not found: ' + command);
        }
    } catch (e) {
        this.log(e.message, 'red');
    }
};

function TextEdit(pointer) {
    this.min_width = 400;
    this.min_height = 300;
    this.max_width = 500;
    this.max_height = 700;
    this.dom = $(templates.textedit);
    this.pointer = pointer;
}
Window.extend(TextEdit);

TextEdit.prototype.focus = function() {
    this.dom.find('textarea').focus();
};