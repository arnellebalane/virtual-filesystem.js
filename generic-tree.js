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
            parent = parent && parent instanceof Node ? parent : this.search(parent);
            var node = new Node(key, parent, properties);
            if (parent === null) {
                this.root = node;
            } else {
                parent.insert(node);
            } 
            return node;
        };

        this.search = function(key) {
            return key && this.root ? this.root.search(key) : null;
        };
    }

    function Node(key, parent, properties) {
        this.key = key;
        this.parent = parent;
        this.children = [];

        properties = properties && typeof properties === 'object' ? properties : {};
        for (var i in properties) {
            this[i] = properties[i];
        }

        this.insert = function(child) {
            this.children.push(child);
        };

        this.search = function(key) {
            if (this.key === key) {
                return this;
            }
            
        };
    }

    var tree = new GenericTree();
    var node = tree.insert('/');
    node = tree.insert('a', node);

    return GenericTree;
});