;+function(context){
    //END OF PROLOG

    var PubSub = context.PubSub,
        viewport = context.viewport,
        $ = context.$,
        globalInstanceId = 1;

    var defaults,
        $body,
        $window;
    
    function Overlay(options) {
        this._id = globalInstanceId++;
        this._clients = [];
        
        PubSub.attach(this);

        this._options = $.extend({}, defaults, options || {});

        $body = $body || $('body');
        $window = $window || $(window);
        
        this._createNode();
        
        var that = this;
        $window.on('resize', function(e){
            that.updateSize();
        });
    }
    Overlay.prototype.getNode = function() {
        return this._$overlay;
    };
    Overlay.prototype._createNode = function() {
        this._isShown = false;
        this._zIndex = this._options.zIndex;
        
        this._$overlay = $('<div/>')
            .css({
                top: 0,
                left: 0,
                width: '100%',
                position: 'absolute',
                zIndex: this._zIndex,
                background: '#000',
                opacity: 0.7
            })
            .prop('id', this._options.prefix + this._id)
            .appendTo($body);
    };
    Overlay.prototype.setZindex = function(zIndex) {
        this._$overlay.css('z-index', zIndex);
        this._zIndex = zIndex;

        this.pub('afterSetZindex');
    };
    Overlay.prototype._getHighestZindex = function() {
        var i,
            zMax;
        if (this._clients.length === 0) {
            return this._zIndex;
        }
        i = this._clients.length - 1;
        zMax = this._clients[i][1];
        for (--i; i >= 0; --i) {
            if (this._clients[i][1] > zMax) {
                zMax = this._clients[i][1];
            }
        }
        return zMax;
    };
    Overlay.prototype._removeClient = function(clientId) {
        var i = this._clients.length,
            newZindex;
        while (--i >= 0) {
            if (this._clients[i][0] === clientId) {
                this._clients.splice(i--, 1);
            }
        }
        newZindex = this._getHighestZindex();
        if (newZindex !== this._zIndex) {
            this.setZindex(newZindex);
            return true;
        } else {
            return false;
        }
    };
    Overlay.prototype._addClient = function(clientId, zIndex) {
        var newZindex,
            zIndexGiven = zIndex != null;
        this._clients.push([clientId, zIndexGiven ? zIndex : this._zIndex]);
        if (!zIndexGiven) {
            return false;
        }
        newZindex = this._getHighestZindex();
        if (newZindex !== this._zIndex) {
            this.setZindex(newZindex);
            return true;
        } else {
            return false;
        }
    };
    Overlay.prototype.show = function(clientId, zIndex){
        var zIndexUpdated = this._addClient(clientId, zIndex);
        
        if (this._isShown && !zIndexUpdated) {
            return;
        }
        
        this.updateSize(true);
        this._$overlay.show();
        this._isShown = true;

        this.pub('afterShow');
    };
    Overlay.prototype.hide = function(clientId){
        this._removeClient(clientId);

        if (!this._isShown || this._clients.length !== 0) {
            return;
        }
        this._$overlay.hide();
        this._isShown = false;

        this.pub('afterHide');
    };
    Overlay.prototype.updateSize = function(force){
        if (!force && !this._isShown) {
            return;
        }
        
        this._$overlay.hide();
            
        var width = Math.max(viewport.getLayoutWidth(), viewport.getVisualWidth()),
            height = Math.max(viewport.getLayoutHeight(), viewport.getVisualHeight());
        
        this._$overlay
            .css({
                width: width + 'px',
                height: height + 'px'
            })
            .show();
        
        this.pub('afterUpdateSize');
    };
    Overlay.prototype.cleanup = function(){
        if (!this._$overlay) {
            return;
        }
        
        this._$overlay.remove();
        this._$overlay = null;
        this._isShown = false;
        this._clients = null;

        this.pub('afterCleanup');
    };
    
    defaults = {
        prefix: 'overlay',
        zIndex: 99999
    };

    context.Overlay = Overlay;
}(this);
