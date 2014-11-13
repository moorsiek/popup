;+function(context){
    //END OF PROLOG

    var PubSub = context.PubSub,
        Overlay = context.Overlay,
        $ = context.$,
        fixedSupported = context.supportsPositionFixed,
        globalInstanceId = 1,
        baseZindex = 99999,
        instancesInUse = 0,
        maxZindex = baseZindex,
        defaults,
        $body, //cached jquery-ed DOM body node
        $window, //cached jquery-ed window object
        overlay; //overlay instance, shared among all popup instances
    
    //constants
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
        maxZindex += this._options.modal ? 2 : 1;
        this._zIndex = maxZindex;
        this._closing = false;

        ++instancesInUse;
        
        var self = this;
        this
            .sub('resize', function(){
                self._setSize();
            })
            .sub('cmd', function(cmd){
                if (cmd === 'close') {
                    self.close();
                } else if (cmd.indexOf('pub-') === 0) {
                    var pubTopic = cmd.substr(4);
                    self.pub(pubTopic);
                } else {
                    
                }
            });
        
        $(document).on('keydown.' + this._options.namespace + this._id, function(e) {
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
    Popup.setBaseZindex = function(zIndex) {
        baseZindex = zIndex;
        if (instancesInUse === 0) {
            maxZindex = baseZindex;
        }
    };
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
            width: this._width + 'px'
            //TODO: research if we really need setting particular height
            //height: this._height + 'px'
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
            //TODO: remove after testing
            window.overlay = overlay;
            
            this._showOverlay();
            
            //TODO: probably, replace per-instance overlay.on with one shared handler
            //TODO: remove dependency on private _$overlay field!
            overlay._$overlay.on('click.' + this._options.namespace + this._id, function(e){
                e.preventDefault();
                self.close();
            });
        }

        this._opened = true;
    };
    Popup.prototype._showOverlay = function() {
        overlay.show(this._options.namespace + this._id, this._zIndex - 1);
    };
    Popup.prototype._hideOverlay = function() {
        overlay.hide(this._options.namespace + this._id);
    };
    Popup.prototype.close = function() {
        if (!this._opened || this._closing) {
            return;
        }
        this._closing = true;

        //TODO: remove dependency on private _$overlay field!
        overlay._$overlay.off('click.' + this._options.namespace + this._id);
        
        if (this._options.modal) {
            this._hideOverlay();
        }
        this.pub('close');
        this._$widget.hide();
        
        this._opened = false;

        this._closing = false;
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

        if (--instancesInUse === 0) {
            maxZindex = baseZindex;
        } else if (this._zIndex === maxZindex) {
            --maxZindex;
        }
    };
    Popup.prototype.center = function() {
        var $window = $(window),
            left,
            top,
            css;

        var viewportWidth = viewport.getVisualWidth(),
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
        
        this._$widget = $('<div style="position: absolute; display: block; z-index: ' + this._zIndex + ';"/>')
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
    Popup.prototype.getNode = function() {
        return this._$widget;
    };
    Popup.defaults = defaults = {
        namespace: 'popup'
    };
    
    //TODO: move this function to some utility module/lib
    Popup.extend = function(Child, Parent) {
        function dummy(){}
        dummy.prototype = Parent.prototype;
        Child.prototype = new dummy;
        Child.prototype.constructor = Parent;
        Child.prototype.__superclass__ = Parent;
    };

    context.Popup = Popup;
}(this);
