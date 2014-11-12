;+function(context){
    //END OF PROLOG

    var PubSub = context.PubSub,
        Overlay = context.Overlay,
        $ = context.$,
        fixedSupported = context.supportsPositionFixed,
        globalInstanceId = 1;

    var defaults,
        $body,
        $window,
        overlay,
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
            overlay.updateSize();
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
    Popup.prototype.open = function() {
        var self = this;
        
        if (this._opened) {
            return;
        }
        
        this.pub('open');
        this._$widget.show();
        this.center();
        if (this._options.modal) {
            if (!overlay) overlay = new Overlay();
            
            this._showOverlay(); //overlay.show();
            
            overlay._$overlay.on('click.' + this._options.namespace + this._id, function(e){
                e.preventDefault();
                self.close();
            });
        }

        this._opened = true;
    };
    Popup.prototype._showOverlay = function() {
        overlay.show(this._options.namespace + this._id);
    };
    Popup.prototype._hideOverlay = function() {
        overlay.show(this._options.namespace + this._id);
    };
    Popup.prototype.close = function() {
        if (!this._opened) {
            return;
        }
        
        if (this._options.modal) {
            this._hideOverlay(); //overlay.hide();
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

        var layoutWidth = viewport.getLayoutWidth(),
            layoutHeight = viewport.getLayoutHeight(),
            viewportWidth = viewport.getVisualWidth(),
            viewportHeight = viewport.getVisualHeight(),
            scrollLeft = $(window).scrollLeft(),
            scrollTop = $(window).scrollTop();

        var higherHeight = this._height > viewportHeight,
            higherWidth = this._width > viewportWidth;

        if (higherWidth || higherHeight || !fixedSupported) {
            css = {
                position: 'absolute',
                margin: 0
            };
            if (higherWidth) {
                css.left = scrollLeft + 'px';
            } else {
                css.left = Math.floor(viewportWidth / 2 - this._width / 2 + scrollLeft) + 'px';
            }
            if (higherHeight) {
                css.top = scrollTop + 'px';
            } else {
                css.top = Math.floor(viewportHeight / 2 - this._height / 2 + scrollTop) + 'px';
            }
        } else {
            css = {
                position: 'fixed',
                left: '50%',
                top: '50%',
                margin: (-this._height / 2) + 'px 0 0 ' + (-this._width / 2) + 'px'
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
