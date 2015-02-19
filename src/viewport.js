(function(window) {
    window.viewport = {};

    window.viewport.getVisualHeight = function () {
        return window.innerHeight != null ? window.innerHeight : document.documentElement.clientHeight;
    };

    window.viewport.getVisualWidth = function () {
        return window.innerWidth != null ? window.innerWidth : document.documentElement.clientWidth;
    };
    
    window.viewport.getLayoutWidth = function() {
        return $(document).width();
    };

    window.viewport.getLayoutHeight = function() {
        return $(document).height();
    };
})(this);