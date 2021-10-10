function ObsEmitter() {
    this.consumers = {};
}

ObsEmitter.prototype.next = function (value) {
    for (let key in this.consumers) {
        this.consumers[key](value); // Should I use hasOwnProperty?
    }
};

ObsEmitter.prototype.subscribe = function (callback) {

    // This is necessary for "| async" in Angular
    if ("next" in callback) {
        callback = callback.next;
    }

    // This is a kind of unique id
    let namespace = Math.random().toString(36).slice(2);

    this.consumers[namespace] = callback;

    let usub = () => {
        delete this.consumers[namespace];
    };

    return {
        usub,
        unsubscribe: usub
    };
};

function ObsCacher(value = undefined) {
    this.value = value;
    this.consumers = {};
}

ObsCacher.prototype.next = function (value) {
    this.value = value;
    for (let key in this.consumers) {
        this.consumers[key](value); // Should I use hasOwnProperty?
    }
};

ObsCacher.prototype.getValue = function () {
    return this.value;
};

ObsCacher.prototype.subscribe = function (callback) {

    // This is necessary for "| async" in Angular
    if ("next" in callback) {
        callback = callback.next;
    }

    // Run it with last value
    callback(this.value);

    // This is a kind of unique id
    let namespace = Math.random().toString(36).slice(2);

    this.consumers[namespace] = callback;

    let usub = () => {
        delete this.consumers[namespace];
    };

    return {
        usub,
        unsubscribe: usub
    };
};

function ObsReplayer(bufferSize, expireTime) {
    this.bufferSize = bufferSize || Number.MAX_SAFE_INTEGER;
    this.expireTime = expireTime || Number.MAX_SAFE_INTEGER;
    this.values = new DoublyLinkedList();
    this.consumers = {};
}

ObsReplayer.prototype.next = function (value) {
    this.values.push({
        timestamp: (new Date()).getTime(),
        value
    });
    for (let key in this.consumers) { // Should I use hasOwnProperty?
        this.consumers[key](
            this.getValues()
        );
    }
};

ObsReplayer.prototype.getValues = function () {
    let collected = [];
    let count = this.bufferSize;
    this.values.traverseReverse((node) => {
        if (!count) {
            this.values.remove(node);
            return;
        }
        let dt = (new Date()).getTime() - node.data.timestamp;
        if (dt > this.expireTime) {
            this.values.remove(node);
            return;
        }
        collected.push(node.data.value);
        count--;
    });
    return collected.reverse();
};

ObsReplayer.prototype.subscribe = function (callback) {

    // This is necessary for "| async" in Angular
    if ("next" in callback) {
        callback = callback.next;
    }

    // Run it with last values
    callback(this.getValues());

    // This is a kind of unique id
    let namespace = Math.random().toString(36).slice(2);

    this.consumers[namespace] = callback;

    let usub = () => {
        delete this.consumers[namespace];
    };

    return {
        usub,
        unsubscribe: usub
    };
};

function Node(data, prev, next) {
    this.data = data;
    this.prev = prev;
    this.next = next;
}

function DoublyLinkedList() {
    this.head = null;
    this.tail = null;
}

DoublyLinkedList.prototype.push = function (data) {
    if (!this.tail) {
        let node = new Node(data, null, null);
        this.head = node;
        this.tail = node;
    }
    else {
        this.tail.next = new Node(data, this.tail, null);
        this.tail = this.tail.next;
    }
};

DoublyLinkedList.prototype.remove = function (node) {
    if (this.head === this.tail && this.tail === node) {
        this.head = null;
        this.tail = null;
    }
    else if (this.head === node) {
        node.next.prev = null;
        this.head = node.next;
    }
    else if (this.tail === node) {
        node.prev.next = null;
        this.tail = node.prev;
    }
    else {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
};

DoublyLinkedList.prototype.traverseReverse = function (fn) {
    if (!this.tail) return;
    let cursor = this.tail;
    do {
        fn(cursor);
        cursor = cursor.prev;
    }
    while (cursor);
};

module.exports = {
    ObsEmitter,
    ObsCacher,
    ObsReplayer
};