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
    },
    keypressed: function(e) {
        if (e.keyCode === 9) {
            e.preventDefault();
        } else {
            var length = terminal.input.val().length + terminal.prompt_length;
            length -= e.keyCode === 8 ? 1 : 0;
            terminal.input.height((~~(length / 87) + 1) * 14);
            if (terminal.contents.height() >= 345) {
                terminal.contents.addClass('overflown');
            } else {
                terminal.contents.removeClass('overflown');
            }
        }
    }
};
terminal.initialize();