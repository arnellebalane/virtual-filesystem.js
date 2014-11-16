$(document).ready(function() {
    components.initialize();
    windows.initialize();
});

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
                windows.focus(target);
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
            if (e.keyCode === 9) {
                e.preventDefault();
            } else if (e.keyCode === 13) {
                e.preventDefault();
            } else {

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
                windows.focus(windows.instances[$(this).data('instance')]);
            });
        } else {
            $('.window').removeClass('focused');
            target.dom.addClass('focused');
            windows.desktop.append(target.dom);
            setTimeout(function() {
                target.focus();
            }, 0);
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
            windows.focus(windows.instances[last.data('instance')]);
        }
    },
    actions: function() {
        windows.desktop.on('mousedown', '.window .action', function(e) {
            e.stopPropagation();
            var target = windows.instances[$(this).closest('.window').data('instance')];
            windows.focus(target);
            if ($(this).hasClass('close')) {
                windows.close(target);
            } else if ($(this).hasClass('minimize')) {
                target.minimize();
                target.dom.removeClass('maximized');
            } else if ($(this).hasClass('maximize')) {
                target.maximize();
                target.dom.addClass('maximized');
            }
        });
    }
};

var applications = {
    finder: function() {
        return new Finder();
    },
    terminal: function() {
        return new Terminal();
    },
    textedit: function() {
        return new TextEdit();
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

function Window() {
    this.focus = function() {};

    this.minimize = function() {
        if (this.dom.hasClass('maximized')) {
            this.dom.animate({
                top: this.dom.offset().top + (this.max_height - this.min_height) / 2 + 'px',
                left: this.dom.offset().left + (this.max_width - this.min_width) / 2 + 'px',
                width: this.min_width + 'px',
                height: this.min_height + 'px'
            }, 150);
        }
    };

    this.maximize = function() {
        if (!this.dom.hasClass('maximize')) {
            this.dom.animate({
                top: this.dom.offset().top - (this.max_height - this.min_height) / 2 + 'px',
                left: this.dom.offset().left - (this.max_width - this.min_width) / 2 + 'px',
                width: this.max_width + 'px',
                height: this.max_height + 'px'
            }, 150);
        }
    };
}
Class.extend(Window);

function Finder() {
    this.min_width = 700;
    this.min_height = 400;
    this.max_width = window.innerWidth - 100;
    this.max_height = window.innerHeight - 100;
    this.dom = $(templates.finder);

    this.maximize = function() {
        if (!this.dom.hasClass('maximize')) {
            this.dom.animate({
                top: 50 + 'px',
                left: 50 + 'px',
                width: this.max_width + 'px',
                height: this.max_height + 'px'
            }, 150);
        }
    };
}
Window.extend(Finder);

function Terminal() {
    this.min_width = 500;
    this.min_height = 300;
    this.max_width = 800;
    this.max_height = 500;
    this.dom = $(templates.terminal);

    this.focus = function() {
        this.dom.find('textarea').focus();
    };
}
Window.extend(Terminal);

function TextEdit() {
    this.min_width = 400;
    this.min_height = 300;
    this.max_width = 500;
    this.max_height = 700;
    this.dom = $(templates.textedit);

    this.focus = function() {
        this.dom.find('textarea').focus();
    };
}
Window.extend(TextEdit);