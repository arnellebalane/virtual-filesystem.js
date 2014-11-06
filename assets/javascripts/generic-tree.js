(function(root, library) {
    if (typeof define === 'function' && define.amd) {
        define('generic-tree', [], library);
    } else {
        root.GenericTree = library();
    }
})(this, function() {
    function GenericTree() {
        this.root = null;

        this.insert = function(key, parent, properties) {
            parent = parent !== undefined && parent instanceof Node ? [parent] : this.search(parent);
            var node = new Node(key, properties);
            if (parent === null && !this.root) {
                this.root = node;
            } else if (parent === null && !!this.root) {
                throw new Error('GenericTree already has a root. Please specify the node\'s parent.');
            } else if (!parent.length) {
                throw new Error('Parent node not found.');
            } else {
                parent[0].insert(node);
            } 
            return node;
        };

        this.delete = function(node) {
            var targets = node instanceof Node ? [node] : this.search(node);
            if (targets === null || !targets.length) {
                throw new Error('Target node not found.');
            }
            for (var i = 0; i < targets.length; i++) {
                var target = targets[i];
                if (target === this.root) {
                    this.root = null;
                } else {
                    target.parent.delete(target);
                }
            }
        };

        this.search = function(key) {
            return key !== undefined && this.root ? this.root.search(key) : null;
        };
    }

    function Node(key, properties) {
        this.key = key;
        this.parent = null;
        this.children = [];

        properties = properties && typeof properties === 'object' ? properties : {};
        for (var i in properties) {
            this[i] = properties[i];
        }

        this.insert = function(child) {
            this.children.push(child);
            child.parent = this;
        };

        this.delete = function(child) {
            this.children.splice(this.children.indexOf(child), 1);
        };

        this.search = function(key) {
            var results = this.key === key ? [this] : [];
            for (var i in this.children) {
                results = results.concat(this.children[i].search(key));
            }
            return results;
        };
    }

    return GenericTree;
});