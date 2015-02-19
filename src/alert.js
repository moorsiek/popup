;+function(context){
    //END OF PROLOG

    var Popup = context.Popup,
        $ = context.$;

    var defaults;
    
    Popup.extend(Alert, Popup);
    function Alert(title, message, okText, options) {
        if (options == null) {
            if (okText != null && typeof okText !== 'string') {
                options = okText;
                okText = void(0);
            } else if (message != null && typeof message !== 'string') {
                options = message;
                message = void(0);
            }
        }
        this._options = $.extend({}, defaults, options || {});
        okText = okText == null ? 'Ок' : okText;
        this._$content = this._createContent(title, message, okText);

        Popup.call(this, this._$content, this._options);
        
        if (this._options.autoOpen) {
            this.open();
        }
    }
    
    Alert.prototype._createContent = function(title, message, okText) {
        var o = this._options,
            buttonClass,
            html;
        
        buttonClass = o.cssPrefix + '-popup__button';
        if (o.buttonModifier) {
            buttonClass += ' ' + buttonClass + o.buttonModifier;
        }
            
        html =
            '<div class="' + o.cssPrefix + '-popup ' + (o.hideButton ? o.cssPrefix + '-popup_buttonless' : '') + '" >' +
                '<a tabindex="2" class="' + o.cssPrefix + '-popup__close" href="#" title="Закрыть" data-' + o.namespace + '-cmd="close"></a>' +
                ((title != null) ? '<div class="' + o.cssPrefix + '-popup__title">' + title + '</div>' : '') +
                ((message != null) ? '<p class="' + o.cssPrefix + '-popup__content">' + message + '</p>' : '') +
                ( o.hideButton ? '' : (
                '<div class="' + o.cssPrefix + '-popup__buttons">' +
                    '<input tabindex="1" class="' + buttonClass + '" type="submit" value="' + okText + '" data-' + o.namespace + '-cmd="close">' +
                '</div>'
                )) +
            '</div>';
        return $(html);
    };
    
    Alert.defaults = defaults = {
        namespace: 'alert',
        modal: true,
        autoOpen: true,
        cssPrefix: 'b-alert',
        buttonModifier: '',
        hideButton: false,
        autoCleanup: true
    };

    context.Alert = Alert;
}(this);
