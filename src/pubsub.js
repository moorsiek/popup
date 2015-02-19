;+function(context){
    function PubSub() {
        this.topics_ = {};

    }
    PubSub.attach = function(obj) {
        var pubSub = new PubSub();

        obj.pub = bind(pubSub, pub);
        obj.sub = bind(pubSub, sub);
        obj.unsub = bind(pubSub, unsub);
        
        return pubSub;
    };
    PubSub.prototype.sub = sub;
    PubSub.prototype.pub = pub;
    PubSub.prototype.unsub = unsub;
    PubSub.prototype.cleanup = cleanup;
    PubSub.prototype.getPublicApi = getPublicApi;

    function bind(obj, method) {
        return function() {
            var args = Array(arguments.length);
            for (var i = args.length - 1; i >= 0; --i) {
                args[i] = arguments[i];
            }
            return method.apply(obj, args);
        };
    }
    function cleanup() {
        delete this.topics_;
    }
    function getPublicApi() {
        return {
            pub: bind(this, pub),
            sub: bind(this, sub),
            unsub: bind(this, unsub)
        };
    }
    function sub(topic, handler) {
        if (!this.topics_.hasOwnProperty(topic)) {
            this.topics_[topic] = [handler];
        } else {
            this.topics_[topic].push(handler);
        }
        return this;
    }
    function unsub(topic, handler) {
        var subscribers;

        if (!this.topics_.hasOwnProperty(topic)) {
            return this;
        } else {
            subscribers = this.topics_[topic];
            for (var i = subscribers.length - 1; i >= 0; --i) {
                if (subscribers[i] === handler) {
                    subscribers.splice(i, 1);
                    break;
                }
            }
        }

        return this;
    }
    function pub(topic, data) {
        var subscribers;
        
        if (this.topics_.hasOwnProperty(topic)) {
            subscribers = this.topics_[topic];
            for (var i = 0, ilim = subscribers.length; i < ilim; ++i) {
                subscribers[i](data);
            }
        }

        return this;
    }

    if (typeof module === 'object' && module.exports) {
        module.exports = exports = PubSub;
    } else if (typeof define === 'function' && define.amd) {
        define(function(){
            return Pubsub;
        });
    } else {
        context.PubSub = PubSub;
    }
}(this);