$(document).ready(function() {
    components.initialize();
    windows.initialize();
});

var components = {
    initialize: function() {
        components.icons();
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
    }
};

var windows = {
    desktop: $('#desktop'),
    initialize: function() {
        windows.focus();
        windows.draggable();
        windows.actions();
    },
    spawn: function(application) {
        template = $(templates[application]);
        windows.desktop.append(template);
        windows.focus(template);
    },
    focus: function(target) {
        if (target === undefined) {
            windows.desktop.on('mousedown', '.window', function(e) {
                windows.focus($(this));
            });
        } else {
            $('.window').removeClass('focused');
            target.addClass('focused');
            windows.desktop.append(target);
            setTimeout(function() {
                applications[target.data('application')].focus(target);
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
        target.remove();
        var last = windows.desktop.find('.window').last();
        if (last.length) {
            windows.focus(last);
        }
    },
    actions: function() {
        windows.desktop.on('mousedown', '.window .action', function(e) {
            e.stopPropagation();
            var parent = $(this).closest('.window');
            if ($(this).hasClass('close')) {
                windows.close(parent);
            }
        });
    }
};

var applications = {
    finder: {
        focus: function(target) {}
    },
    terminal: {
        focus: function(target) {
            target.find('textarea').trigger('focus');
        }
    },
    textedit: {
        focus: function(target) {
            target.find('textarea').focus();
        }
    }
};

var templates = {
    finder: $('template#finder').html(),
    terminal: $('template#terminal').html(),
    textedit: $('template#textedit').html()
};