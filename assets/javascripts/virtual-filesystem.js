(function(root, library) {
    if (typeof define === 'function' && define.amd) {
        define('virtual-filesystem', ['generic-tree'], library);
    } else {
        root.VirtualFilesystem = library(root.GenericTree);
    }
})(this, function(GenericTree) {
    function VirtualFileSystem() {
        this.tree = new GenericTree();
        this.tree.insert('');
        this.pointer = this.tree.root;

        this.mkdir = function(path) {
            path = path.replace(/\/+$/g, '');
            var segments = path.split('/');
            var parent = this._resolve_path(segments.slice(0, segments.length - 1).join('/'));
            var name = segments[segments.length - 1];
            this.tree.insert(name, parent, { type: 'directory' });
        };

        this.rmdir = function(path) {
            path = path.replace(/\/+$/g, '');
            var node = this._resolve_path(path);
            if (node === this.tree.root) {
                throw new Error('You cannot delete the root directory.');
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
        };

        this._resolve_path = function(path) {
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
                        throw new Error('Path does not exists: ' + path.slice(0, i + 1).join('/'));
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