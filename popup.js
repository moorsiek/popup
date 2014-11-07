;+function(context){
    //END OF PROLOG

    var PubSub = context.PubSub,
        $ = context.$,
        fixedSupported = context.supportsPositionFixed,
        globalInstanceId = 1;

    var defaults,
        $body,
        $window,
        $overlay,
        overlayClients = 0;
    
    var KEYCODE_ESC = 27;
        
    function Popup($content, options) {
        PubSub.attach(this);

        this._options = $.extend({}, defaults, options || {});
        
        $body = $body || $('body');
        $window = $window || $(window);
        
        this._$content = $($content);
        this._$widget = null;
        this._opened = false;
        this._id = globalInstanceId++;
        
        var self = this;
        this
            .sub('resize', function(){
                self._setSize();
            })
            .sub('cmd', function(cmd){
                switch (cmd) {
                    case 'close':
                        self.close();
                        break;
                    default:
                        break;
                }
            });
        
        $(document).bind('keydown.' + this._options.namespace + this._id, function(e) {
            if (e.keyCode == KEYCODE_ESC) {
                e.preventDefault();
                self.close();
            }
        });
        
        $(window).resize(function(){
            Popup._sizeOverlay();
            self.center();
        });
        
        this._bindCmds();
        
        this._render();
    }
    Popup.prototype._bindCmds = function() {
        var self = this;
        
        this._$content
            .find('*')
            .each(function(){
                var $this = $(this),
                    cmds = $this.data(self._options.namespace + 'Cmd');
                
                if (!cmds) {
                    return;
                }
    
                cmds = cmds
                    .replace(/^\s+|\s+$/g, '')
                    .split(/\s*,\s*/); 
                
                $this.on('click', function(e){
                    e.preventDefault();
                    
                    for (var i = 0, ilim = cmds.length; i < ilim; ++i) {
                        self.pub('cmd', cmds[i]);
                    }
                });
            });
    };
    Popup.report = function(){
        var rep = '';
        rep += 'w.$width=' + $(window).width();
        rep += "\n";
        rep += 'w.innerWidth=' + window.innerWidth;
        rep += "\n";
        rep += 'd.clientWidth=' + document.documentElement.clientWidth;
        rep += "\n";
        rep += 'd.offsetWidth=' + document.documentElement.offsetWidth;
        rep += "\n";
        rep += 'd.body.clientWidth=' + document.body.clientWidth;
        rep += "\n";
        rep += 'd.$width=' + $(document).width();
        rep += "\n";
        alert(rep);
    };
    Popup.prototype._setSize = function() {
        var width,
            height;
        
        this._$widget.css({
            width: this._options.width == null ? 'auto' : this._options.width,
            height: 'auto'
        });
        
        this._width = Math.floor(this._$widget.width());
        this._height = Math.floor(this._$widget.height());
        
        this._$widget.css({
            width: width + 'px',
            height: height + 'px'
        });
    };
    Popup._createOverlay = function() {
        $overlay = $('<div/>')
            .css({
                top: 0,
                left: 0,
                width: '100%',
                position: 'absolute',
                zIndex: 99999,
                background: '#000',
                opacity: 0.7
            })
            .appendTo($body);
        return $overlay;
    };
    Popup.prototype._onWindowResize = function() {
        if ($overlay) {
            
        }
    };
    Popup._sizeOverlay = function(force) {
        if (!force && (!$overlay || !$overlay.is(':visible'))) {
            return;
        }
        
        $overlay.hide();
        var height = Math.max($(document).outerHeight(), $body.outerHeight(), $(window).height());
        $overlay
            .css({
                height: height + 'px'
            })
            .show();
    };
    Popup._showOverlay = function() {
        $overlay = $overlay || Popup._createOverlay();
        Popup._sizeOverlay(true);
        ++overlayClients;
        $overlay.show();
    };
    Popup._hideOverlay = function() {
        if ($overlay) {
            overlayClients = Math.max(--overlayClients, 0);  
            if (overlayClients === 0) {
                $overlay.hide();
            }
        }
    };
    Popup.prototype.open = function() {
        var self = this;
        
        if (this._opened) {
            return;
        }
        
        this.pub('open');
        this._$widget.show();
        this.center();
        if (this._options.modal) {
            Popup._showOverlay();
            
            $overlay.on('click.' + this._options.namespace + this._id, function(e){
                e.preventDefault();
                self.close();
            });
        }

        this._opened = true;
    };
    Popup.prototype.close = function() {
        if (!this._opened) {
            return;
        }
        
        if (this._options.modal) {
            Popup._hideOverlay();
        }
        this.pub('close');
        this._$widget.hide();
        
        this._opened = false;
    };
    Popup.prototype.cleanup = function() {
        this.pub('cleanup');
        this.close();
        
        this._$widget
            .off('.' + this._options.namespace + this._id)
            .detach()
            .remove();

        $(document)
            .unbind('keydown.' + this._options.namespace + this._id);
        
        delete this._$content;
        delete this._$widget;
        delete this._options;
    };
    Popup.prototype.center = function() {
        var $window = $(window),
            left,
            top,
            css;

        if (false && fixedSupported) {
            css = {
                position: 'fixed',
                left: '50%',
                top: '50%',
                margin: (-this._height / 2) + 'px 0 0 ' + (-this._width / 2) + 'px'
            };
        } else {
            css = {
                left: (Math.floor($window.outerWidth(true) / 2 - this._width / 2 + $(window).scrollLeft())) + 'px',
                top: (Math.floor($window.outerHeight(true) / 2 - this._height / 2 + $(window).scrollTop())) + 'px'
            };
        }
        this._$widget.css(css);
    };
    Popup.prototype._render = function() {
        var o = this._options,
            self = this;
        
        this._$widget = $('<div style="position: absolute; display: block; z-index: 100000;"/>')
            .addClass('popup')
            .append(this._$content)
            .on('close.' + this._options.namespace + this._id, function(e){
                e.stopPropagation();
                self.close();
            })
            .on('cleanup.' + this._options.namespace + this._id, function(e){
                e.stopPropagation();
                self.cleanup();
            });

        $body.append(this._$widget);
        this._setSize();
        this._$widget.hide();
    };

    defaults = {
        namespace: 'popup'
    };

    context.Popup = Popup;
}(this);
