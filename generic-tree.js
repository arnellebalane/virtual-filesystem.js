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
            parent = parent && parent instanceof Node ? [parent] : this.search(parent);
            var node = new Node(key, properties);
            if (parent === null && !this.root) {
                this.root = node;
            } else if (parent === null && !!this.root) {
                throw new Error('Generic Tree already has a root. Please specify the node\'s parent.');
            } else if (!parent.length) {
                throw new Error('Node\'s parent not found.');
            } else {
                parent[0].insert(node);
            } 
            return node;
        };

        this.search = function(key) {
            return key && this.root ? this.root.search(key) : null;
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