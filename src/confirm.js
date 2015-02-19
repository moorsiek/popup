;+function(context){
    //END OF PROLOG

    var Popup = context.Popup,
        $ = context.$;

    var defaults;
    
    Popup.extend(Confirm, Popup);
    function Confirm(title, message, okText, cancelText, options) {
        if (options == null) {
            if (okText != null && typeof okText !== 'string') {
                options = okText;
                okText = void(0);
            } else if (cancelText != null && typeof cancelText !== 'string') {
                options = cancelText;
                cancelText = void(0);
            }
        }
        this._options = $.extend({}, defaults, options || {});
        okText = okText == null ? 'Ок' : okText;
        cancelText = cancelText == null ? 'Отмена' : cancelText;
        this._$content = this._createContent(title, message, okText, cancelText);
        
        Popup.call(this, this._$content, this._options);

        var that = this;
        this
            .sub('close', function(){
                if (!that.result) {
                    that.pub('cancel');
                }
            })
            .sub('cancel', function(){
                that.result = 'cancel';
                that.close();
            })
            .sub('ok', function(){
                that.result = 'ok';
                that.close();
            });
        
        if (this._options.autoOpen) {
            this.open();
        }
    }
    Confirm.prototype.close = function() {
        Popup.prototype.close.call(this);
        this.result = null;
    };
    Confirm.prototype._createContent = function(title, message, okText, cancelText) {
        var o = this._options,
            buttonClass,
            okButtonClass,
            cancelButtonClass,
            html;

        buttonClass = o.cssPrefix + '-popup__button';
        okButtonClass = cancelButtonClass = buttonClass;

        okButtonClass += ' ' + buttonClass + '_ok';
        if (o.okButtonModifier) {
            okButtonClass += ' ' + buttonClass + o.okButtonModifier;
        }

        cancelButtonClass += ' ' + buttonClass + '_cancel';
        if (o.cancelButtonModifier) {
            cancelButtonClass += ' ' + buttonClass + o.cancelButtonModifier;
        }

        html = '<div class="' + o.cssPrefix + '-popup">' +
                   '<a tabindex="-1" class="' + o.cssPrefix + '-popup__close" href="#" title="Закрыть" data-' + o.namespace + '-cmd="pub-cancel"></a>' +
                   ((title != null) ? '<div class="' + o.cssPrefix + '-popup__title">' + title + '</div>' : '') +
                   ((message != null) ? '<p class="' + o.cssPrefix + '-popup__content">' + message + '</p>' : '') +
                   '<div class="' + o.cssPrefix + '-popup__buttons ' + o.cssPrefix + '-popup__buttons_tuple">' +
                       '<input tabindex="1" class="' + cancelButtonClass + '" type="submit" value="' + cancelText + '" data-' + o.namespace + '-cmd="pub-cancel">' +
                       '<input tabindex="2" class="' + okButtonClass + '" type="submit" value="' + okText + '" data-' + o.namespace + '-cmd="pub-ok">' +
                   '</div>' +
               '</div>';
        return $(html);
    };

    Confirm.defaults = defaults = {
        namespace: 'confirm',
        modal: true,
        autoOpen: true,
        cssPrefix: 'b-toru',
        okButtonModifier: '_mood_negative',
        cancelButtonModifier: '_mood_neutral',
        autoCleanup: true
    };

    context.Confirm = Confirm;
}(this);
