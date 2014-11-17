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
        return path === undefined ? filesystem.instance.tree.root : filesystem.instance._resolve_path(path);
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
        windows.desktop.on('keydown', 'textarea', function(e) {
            var target = windows.instance($(this).closest('.window'));
            if (e.keyCode === 9) {
                e.preventDefault();
            } else if (e.keyCode === 13 && $(this).attr('data-capture-enter') === 'true') {
                e.preventDefault();
                target.execute();
            } else if (e.keyCode === 83 && e.ctrlKey) {
                e.preventDefault();
                target.keyboard_handler(e);
            } else if ($(this).hasClass('autosize')) {
                target.autosize(e);
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
            if (target.hasOwnProperty('pointer')) {
                filesystem.instance.pointer = target.pointer;
            }
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
Window.prototype.keyboard_handler = function() {};

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
    this.buffer = null;
    this.pointer = pointer;
    var self = this;

    this.intercepts = {
        ls: function(path) {
            var results = filesystem.instance.ls(path || filesystem.absolute_path(this.pointer));
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
        },
        cd: function(path) {
            this.location(filesystem.instance.cd(path));
        },
        cat: function(params) {
            params = Array.prototype.slice.call(arguments);
            if (params[0].match('^(>|>>)$') && params.length < 3) {
                params[0] = params[0] === '>>' ? '' : params[0];
                execute.call(this, params);
                params[0] = '>';
                execute.call(this, params);
                this.buffer = 'cat ' + params.join(' ');
                this.input.attr('data-capture-enter', 'false');
                this.prompt.addClass('hidden');
            } else {
                if (!params[0].match('^(>|>>)$')) {
                    params.unshift('');
                }
                execute.call(this, params);
                this.buffer = null;
                this.input.attr('data-capture-enter', 'true');
                this.prompt.removeClass('hidden');
            }

            function execute(params) {
                var output = filesystem.instance.cat.apply(filesystem.instance, params);
                if (output !== undefined) {
                    output = output.split(/\r?\n/g);
                    for (var i = 0; i < output.length; i++) {
                        this.log(output[i]);
                    }
                }
            }
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

Terminal.prototype.autosize = function(e) {
    if (e === undefined) {
        resize();
    } else {
        setTimeout(resize, 0, e);
    }
    
    function resize(e) {
        $(e.target).css('height', 'auto');
        $(e.target).css('height', e.target.scrollHeight + 'px');
    }

    if (this.dom.find('.contents').height() > this.dom.find('main').height()) {
        this.dom.find('.contents').addClass('overflow');
    } else {
        this.dom.find('.contents').removeClass('overflow');
    }
};

Terminal.prototype.keyboard_handler = function(e) {
    if (e.keyCode === 83 && e.ctrlKey) {
        var command = this.buffer + ' "' + this.input.val() + '"';
        this.execute(command);
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
    self.pointer = location;
    self.prompt.text(filesystem.absolute_path(location));
    setTimeout(function() {
        self.input.css('text-indent', (self.prompt.width() / 7 + 1) * 7 - 0.5 + 'px');
    }, 0);
};

Terminal.prototype.execute = function(input) {
    input = input === undefined ? this.input.val().trim() : input;
    if (input.length) {
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
        if (this.buffer === null) {
            this.log(this.prompt.text() + ' $ ' + input);
        } else {
            var buffer = this.input.val().split(/\r?\n/g);
            for (var i = 0; i < buffer.length; i++) {
                this.log(buffer[i]);
            }
        }
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
    } else {
        this.log(this.prompt.text() + ' $');
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