var tree = null;

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
        terminal.log('Run `help` to view available commands.', 'yellow');
    },
    keypressed: function(e) {
        if (e.keyCode === 9) {
            e.preventDefault();
        } else if (e.keyCode === 76 && e.ctrlKey) {
            intercepts.clear();
        } else if (e.keyCode === 13) {
            e.preventDefault();
            var input = terminal.input.val();
            terminal.log(terminal.prompt.text().trim() + ' ' + input);
            if (input.trim().length) {
                terminal.execute(input.trim());
                terminal.input.val('');
            }
        } else {
            var length = terminal.input.val().length + terminal.prompt_length;
            length -= e.keyCode === 8 ? 1 : 0;
            terminal.input.height((~~(length / 86) + 1) * 14);
        }
        if (terminal.contents.height() >= 345) {
            terminal.contents.addClass('overflown');
        } else {
            terminal.contents.removeClass('overflown');
        }
    },
    execute: function(input) {
        var i = input.indexOf(' ');
        var command = input;
        var params = [];
        if (i >= 0) {
            command = input.substring(0, i);
            var buffer = '';
            var inside = false;
            for (i = i + 1; i < input.length; i++) {
                var character = input.charAt(i);
                if (character === ' ' && !inside) {
                    params.push(buffer.replace(/(^["']|["']$)/g, ''));
                    buffer = '';
                    continue;
                } if (character === '"') {
                    inside = !inside;
                }
                buffer += character;
            }
            params.push(buffer.replace(/(^["']|["']$)/g, ''));
        }
        try {
            if (command in intercepts) {
                intercepts[command].apply(null, params);
            } else if (tree === null) {
                terminal.log('Create a tree first using the `create` command.', 'red');
            } else if (command in tree) {
                tree[command].apply(tree, params);
            } else {
                terminal.log('Command not found: ' + command, 'red');
            }
        } catch (e) {
            terminal.log(e.message, 'red');
        }
    },
    log: function(message, color) {
        message = $('<p>' + message.replace(/ /g, '\u00a0') + '</p>');
        message.addClass(color || '');
        terminal.prompt.before(message);
        if (terminal.contents.height() >= 345) {
            terminal.contents.addClass('overflown');
        }
    }
};
terminal.initialize();

var intercepts = {
    create: function() {
        if (tree === null) {
            tree = new GenericTree();
            terminal.log('GenericTree created.', 'green');
        } else {
            terminal.log('You already have a GenericTree. Destroy it first before creating a new one.', 'red');
        }
    },
    destroy: function() {
        if (tree === null) {
            terminal.log('No GenericTree found to destroy.', 'red');
        } else {
            tree = null;
            terminal.log('GenericTree destroyed.', 'green');
        }
    },
    search: function(query) {
        if (query === undefined) {
            throw new Error('Missing argument: query');
        }
        var results = tree.search(query);
        if (results.length) {
            results.forEach(function(node) {
                var path = [];
                while (node !== null) {
                    path.unshift(node.key);
                    node = node.parent;
                }
                terminal.log('  ' + path.join('/'));
            });
        } else {
            terminal.log('No results found: ' + query, 'red');
        }
    },
    display: function() {
        var results = tree.traverse();
        if (results.length) {
            results.forEach(function(level) {
                var string = ' ';
                level.forEach(function(node) {
                    string += ' ' + node.key;
                });
                terminal.log(string);
            });
        } else {
            terminal.log('GenericTree is empty.');
        }
    },
    clear: function() {
        $('#terminal p').remove();
        terminal.contents.removeClass('overflown');
    },
    help: function() {
        terminal.log(' ');
        terminal.log('  create           Create a tree. Only one tree can exist at a time.');
        terminal.log('  insert a [b]     Insert `a` to the current tree under parent `b`. Parent `b`');
        terminal.log('                       is optional only for the root element.');
        terminal.log('  delete a         Delete the element `a`.');
        terminal.log('  search a         Search for all elements `a`.');
        terminal.log('  display          Breadth-first traversal of the tree.');
        terminal.log('  destroy          Destroy the current tree. After this, you can again');
        terminal.log('                       create a new tree.');
        terminal.log('  help             Show this help message.');
        terminal.log(' ');
    }
};