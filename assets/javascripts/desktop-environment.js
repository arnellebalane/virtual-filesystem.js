$(document).ready(function() {
    components.initialize();
    windows.initialize();
});

var components = {
    initialize: function() {
        components.icons();
    },
    icons: function() {
        windows.desktop.on('click', '.icon', function(e) {
            e.stopPropagation();
            if (e.ctrlKey) {
                $(this).toggleClass('highlighted');
            } else {
                $('.icon').removeClass('highlighted');
                $(this).addClass('highlighted');
            }
        });

        windows.desktop.on('dblclick', '.icon[data-application]', function(e) {
            $(this).removeClass('highlighted');
            windows.spawn($(this).data('application'));
        });

        windows.desktop.on('click', function(e) {
            $('.icon').removeClass('highlighted');
        });
    }
};

var windows = {
    desktop: $('#desktop'),
    initialize: function() {
        windows.focus();
    },
    spawn: function(application) {
        template = $(templates[application]);
        template.attr('data-index', $('.window').length);
        windows.desktop.append(template);
        windows.focus(template);
    },
    focus: function(target) {
        if (target === undefined) {
            $('#desktop').on('click', '.window', function(e) {
                $('.window').removeClass('focused');
                $(this).addClass('focused');
                windows.desktop.append($(this));
            });
        } else {
            $('.window').removeClass('focused');
            target.addClass('focused');
            windows.desktop.append(target);
        }
    }
};

var templates = {
    finder: $('template#finder').html(),
    terminal: $('template#terminal').html(),
    textedit: $('template#textedit').html()
};