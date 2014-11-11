var terminal = {
    input: $('#terminal textarea'),
    contents: $('#terminal .contents'),
    prompt: $('#terminal .prompt'),
    prompt_length: $('#terminal span').text().length + 1,
    initialize: function() {
        $('#terminal').on('click', function() {
            terminal.input.focus();
        });
        terminal.input.on('keydown', terminal.keypressed);
        terminal.log('Generic Tree Command Line Tool', 'yellow');
        terminal.log('enter `help` to view available commands', 'yellow');
    },
    keypressed: function(e) {
        if (e.keyCode === 9) {
            e.preventDefault();
        } else if (e.keyCode === 13) {
            e.preventDefault();
            // execute the command in buffer
        } else {
            var length = terminal.input.val().length + terminal.prompt_length;
            length -= e.keyCode === 8 ? 1 : 0;
            terminal.input.height((~~(length / 86) + 1) * 14);
            if (terminal.contents.height() >= 345) {
                terminal.contents.addClass('overflown');
            } else {
                terminal.contents.removeClass('overflown');
            }
        }
    },
    log: function(message, color) {
        message = $('<p>' + message + '</p>');
        message.addClass(color || '');
        terminal.prompt.before(message);
    }
};
terminal.initialize();