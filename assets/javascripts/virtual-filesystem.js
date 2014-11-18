(function(root, library) {
    if (typeof define === 'function' && define.amd) {
        define('virtual-filesystem', ['generic-tree'], library);
    } else {
        root.VirtualFileSystem = library(root.GenericTree);
    }
})(this, function(GenericTree) {
    // @todo: make this extend EventTarget
    function VirtualFileSystem() {
        this.tree = new GenericTree();
        this.tree.insert('', null, { type: 'directory' });
        this.pointer = this.tree.root;

        // @todo: prevent creation of directories with the same name in the same location
        this.mkdir = function(path) {
            var segments = path.replace(/\/+$/g, '').split('/');
            var parent = this._resolve_path(segments.slice(0, segments.length - 1).join('/'));
            var name = segments[segments.length - 1];
            this.tree.insert(name, parent, { type: 'directory' });
        };

        this.rmdir = function(path) {
            var node = this._resolve_path(path.replace(/\/+$/g, ''));
            if (node === this.tree.root) {
                throw new Error('You cannot delete the root directory.');
            } else if (node.type !== 'directory') {
                throw new Error('Not a directory: ' + node.key);
            }
            this.tree.delete(node);
            var current_path = this._absolute_path(this.pointer);
            var node_path = this._absolute_path(node);
            if (node_path.match('^' + current_path) && current_path.length) {
                this.pointer = node.parent;
            }
        };

        this.cd = function(path) {
            this.pointer = this._resolve_path(path);
            return this.pointer;
        };

        // @todo: prevent creation of files with the same name in the same location
        // @todo: throw error if cat-ed path is not a file
        this.cat = function(mode, path, contents) {
            var segments = path.replace(/\/+$/g, '').split('/');
            var parent = this._resolve_path(segments.slice(0, segments.length - 1).join('/'));
            var name = segments[segments.length - 1];
            var node = parent.find(name);
            if (mode.length) {
                if (node === null) {
                    node = this.tree.insert(name, parent, { type: 'file', contents: '' });
                }
                node.contents = mode === '>' ? contents : node.contents + contents;
            } else {
                if (node === null) {
                    throw new Error('File not found: ' + path);
                }
                return node.contents;
            }
        };

        this.rm = function(path) {
            var node = this._resolve_path(path.replace(/\/+$/g, ''));
            if (node.type !== 'file') {
                throw new Error('Not a file: ' + node.key);
            }
            this.tree.delete(node);
        };

        this.rn = function(path, name) {
            var node = this._resolve_path(path);
            if (node === this.tree.root) {
                throw new Error('You cannot rename the root directory.');
            }
            var search = node.parent.find(name);
            if (search && search.type === node.type) {
                throw new Error('Rename failed. Name already taken.');
            }
            node.key = name;
        };

        this.cp = function(target, destination) {
            target = typeof target === 'object' ? target : this._resolve_path(target);
            destination = typeof destination === 'object' ? destination : this._resolve_path(destination);
            var properties = { type: target.type };
            if (properties.type === 'file') {
                properties.contents = target.contents;
            }
            var node = this.tree.insert(target.key, destination, properties);
            for (var i = 0; i < target.children.length; i++) {
                this.cp(target.children[i], node);
            }
            return node;
        };

        this.mv = function(target, destination) {
            target = typeof target === 'object' ? target : this._resolve_path(target);
            destination = typeof destination === 'object' ? destination : this._resolve_path(destination);
            this.tree.delete(target);
            return this.cp.call(this, target, destination);
        };

        this.ls = function(path) {
            var node = path === undefined ? this.pointer : this._resolve_path(path);
            if (node.type === 'directory') {
                return node.children;
            }
            throw new Error('Not a directory: ' + path);
        };

        this.whereis = function(query) {
            return this.tree.search(query);
        };

        this._resolve_path = function(path) {
            path = path.match('^\/') ? path : './' + path;
            path = path.split('/');
            var parent = path[0].length ? this.pointer : this.tree.root;
            for (var i = !path[0].length ? 1 : 0; i < path.length; i++) {
                if (path[i] === '..') {
                    if (parent === this.tree.root) {
                        throw new Error('No more directories beyond root directory.');
                    }
                    parent = parent.parent;
                } else if (path[i] !== '.' && path[i].length) {
                    parent = parent.find(path[i]);
                    if (parent === null) {
                        throw new Error('Path not found: ' + path.slice(0, i + 1).join('/'));
                    }
                }
            }
            return parent;
        };

        this._absolute_path = function(node) {
            var path = [];
            while (node !== null) {
                path.unshift(node.key);
                node = node.parent;
            }
            return path.join('/');
        };
    }

    return VirtualFileSystem;
});