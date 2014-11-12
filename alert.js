;+function(context){
    //END OF PROLOG

    var Popup = context.Popup,
        $ = context.$,
        tmpl = context.tmpl,
        delegatedMethods = [
            'open', 'close', 'cleanup', 'pub', 'sub', 'unsub', 'center'
        ];

    var defaults;
    
    function Alert(title, message, okText, options) {
        this._options = $.extend({}, defaults, options || {});
        okText = okText == null ? 'Ок' : okText;
        this._$content = this._createContent(title, message, okText);
        this._popup = new Popup(this._$content , this._options);
        
        if (this._options.autoOpen) {
            this._popup.open();
        }
    }
    
    Alert.prototype._createContent = function(title, message, okText) {
        var o = this._options,
            html = '<div class="' + o.cssPrefix + '-popup">' +
                '<a class="' + o.cssPrefix + '-popup__close" href="#" title="Закрыть" data-' + o.namespace + '-cmd="close"></a>' +
                ((title != null) ? '<div class="' + o.cssPrefix + '-popup__title">' + title + '</div>' : '') +
                ((message != null) ? '<p class="' + o.cssPrefix + '-popup__content">' + message + '</p>' : '') +
                '<div style="text-align: center;">' +
                '<input class="' + o.cssPrefix + '-popup__button' + o.buttonModifier + '" type="submit" value="' + okText + '">' +
                '</div>' +
                '</div>';
        return $(html);
    };

    for (var i = delegatedMethods.length; --i >= 0;) {
        Alert.prototype[delegatedMethods[i]] = function(method){
            return function(){
                var args = new Array(arguments.length);
                for (var i = args.length; --i >= 0;) {
                    args[i] = arguments[i];
                }
                return this._popup[method].apply(this._popup, args);
            };
        }(delegatedMethods[i]);
    }
    
    Alert.defaults = defaults = {
        namespace: 'popup',
        modal: true,
        autoOpen: true,
        cssPrefix: 'b-toru',
        buttonModifier: ''
    };

    context.Alert = Alert;
}(this);
