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
            var target = $(this).closest('.window');
            windows.focus(target);
            if ($(this).hasClass('close')) {
                windows.close(target);
            } else if ($(this).hasClass('minimize')) {
                applications[target.data('application')].minimize(target);
                target.removeClass('maximized');
            } else if ($(this).hasClass('maximize')) {
                applications[target.data('application')].maximize(target);
                target.addClass('maximized');
            }
        });
    }
};

var applications = {
    finder: {
        focus: function(target) {},
        minimize: function(target) {
            if (target.hasClass('maximized')) {
                target.css({
                    top: target.offset().top + (window.innerHeight - 500) / 2 + 'px',
                    left: target.offset().left + (window.innerWidth - 800) / 2 + 'px',
                    width: '700px',
                    height: '400px'
                });
            }
        },
        maximize: function(target) {
            if (!target.hasClass('maximized')) {
                target.css({
                    top: '50px', 
                    left: '50px', 
                    width: window.innerWidth - 100 + 'px',
                    height: window.innerHeight - 100 + 'px'
                });
            }
        }
    },
    terminal: {
        focus: function(target) {
            target.find('textarea').focus();
        },
        minimize: function(target) {
            if (target.hasClass('maximized')) {
                target.css({
                    top: target.offset().top + 100 + 'px',
                    left: target.offset().left + 150 + 'px',
                    width: '500px',
                    height: '300px'
                });
            }
        },
        maximize: function(target) {
            if (!target.hasClass('maximized')) {
                target.css({
                    width: '800px',
                    height: '500px'
                });
            }
        }
    },
    textedit: {
        focus: function(target) {
            target.find('textarea').focus();
        },
        minimize: function(target) {
            if (target.hasClass('maximized')) {
                target.css({
                    top: target.offset().top + 200 + 'px',
                    left: target.offset().left + 50 + 'px',
                    width: '400px',
                    height: '300px'
                });
            }
        },
        maximize: function(target) {
            if (!target.hasClass('maximized')) {
                target.css({
                    width: '500px',
                    height: '700px'
                });
            }
        }
    }
};

var templates = {
    finder: $('template#finder').html(),
    terminal: $('template#terminal').html(),
    textedit: $('template#textedit').html()
};