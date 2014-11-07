(function(root, library) {
    if (typeof define === 'function' && define.amd) {
        define('virtual-filesystem', ['generic-tree'], library);
    } else {
        root.VirtualFilesystem = library(root.GenericTree);
    }
})(this, function(GenericTree) {
    function VirtualFilesystem() {
        this.tree = new GenericTree();
        this.tree.insert('');
        this.pointer = this.tree.root;

        this.mkdir = function(path) {
            var parent = this._resolve_path(path);
            var name = path.split('/').pop();
            this.tree.insert(name, parent, { type: 'directory' });
        };

        this._resolve_path = function(path) {
            path = path.split('/');
            var parent = path[0].length ? this.pointer : this.tree.root;
            for (var i = !path[0].length ? 1 : 0; i < path.length - 1; i++) {
                if (path[i] === '..') {
                    if (parent === this.tree.root) {
                        throw new Error('No more directories beyond root directory.');
                    }
                    parent = parent.parent;
                } else if (path[i] !== '.') {
                    parent = parent.find(path[i]);
                    if (parent === null) {
                        throw new Error('Path does not exists: ' + path.slice(0, i + 1).join('/'));
                    }
                }
            }
            return parent;
        };
    }

    return VirtualFilesystem;
});