var terminal = {
    initialize: function() {
        $('#terminal').on('click', function() {
            $('textarea').focus();
        });
    }
};
terminal.initialize();