;+function(context){
    //END OF PROLOG

    var Popup = context.Popup,
        $ = context.$,
        tmpl = context.tmpl;

    var defaults;
    
    function extend(Child, Parent) {
        function dummy(){}
        dummy.prototype = Parent.prototype;
        Child.prototype = new dummy;
        Child.prototype.constructor = Parent;
        Child.prototype.__superclass__ = Parent;
    }
    
    extend(Alert, Popup);
    function Alert(title, message, okText, options) {
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
            html = '<div class="' + o.cssPrefix + '-popup">' +
                '<a class="' + o.cssPrefix + '-popup__close" href="#" title="Закрыть" data-' + o.namespace + '-cmd="close"></a>' +
                ((title != null) ? '<div class="' + o.cssPrefix + '-popup__title">' + title + '</div>' : '') +
                ((message != null) ? '<p class="' + o.cssPrefix + '-popup__content">' + message + '</p>' : '') +
                '<div style="text-align: center;">' +
                '<input class="' + o.cssPrefix + '-popup__button" type="submit" value="' + okText + '">' +
                '</div>' +
                '</div>';
        return $(html);
    };
    
    defaults = {
        namespace: 'popup',
        modal: true,
        autoOpen: true,
        cssPrefix: 'b-toru'
    };

    context.Alert = Alert;
}(this);
