function AsyncVar(value = undefined) {
    this.value = value;
    this.consumers = {};
}

AsyncVar.prototype.set = function(value) {
    this.value = value;
    for (let key in this.consumers) {
        this.consumers[key](value); // Should I use hasOwnProperty?
    }
};
AsyncVar.prototype.next = AsyncVar.prototype.set;

AsyncVar.prototype.get = function() {
    return this.value;  
};
AsyncVar.prototype.getValue = AsyncVar.prototype.get;

AsyncVar.prototype.sub = function(callback) {

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
}
AsyncVar.prototype.subscribe = AsyncVar.prototype.sub;

function AsyncPulse() {
    this.consumers = {};
}

AsyncPulse.prototype.set = function(value) {
    for (let key in this.consumers) {
        this.consumers[key](value); // Should I use hasOwnProperty?
    }
};
AsyncPulse.prototype.next = AsyncPulse.prototype.set;

AsyncPulse.prototype.sub = function(callback) {

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
}
AsyncPulse.prototype.subscribe = AsyncPulse.prototype.sub;

module.exports = {
    AsyncVar,
    AsyncPulse
};