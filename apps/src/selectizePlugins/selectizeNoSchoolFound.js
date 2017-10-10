export Selectize.define('no_results', function(options) {
    var self = this;

    options = $.extend({
        message: 'No schools found.',

        html: function(data) {
            return (
                '<div class="selectize-dropdown ' + data.classNames + ' dropdown-empty-message">' +
                    '<div class="selectize-dropdown-content">' + data.message + '</div>' +
                '</div>'
            );
        }
    }, options );

    self.displayEmptyResultsMessage = function () {
        this.$empty_results_container.css( 'top', this.$control.outerHeight() );
        this.$empty_results_container.show();
    };

    self.refreshOptions = (function () {
        var original = self.refreshOptions;

        return function () {
            original.apply( self, arguments );
            this.hasOptions ? this.$empty_results_container.hide() :
                this.displayEmptyResultsMessage();
        }
    })();

    self.onKeyDown = (function () {
        var original = self.onKeyDown;

        return function ( e ) {
            original.apply( self, arguments );
            if ( e.keyCode === 27 ) {
                this.$empty_results_container.hide();
            }
        }
    })();

    self.onBlur = (function () {
        var original = self.onBlur;

        return function () {
            original.apply( self, arguments );
            this.$empty_results_container.hide();
        };
    })();

    self.setup = (function() {
        var original = self.setup;
        return function() {
            original.apply(self, arguments);
            self.$empty_results_container = $( options.html( $.extend( {
                classNames: self.$input.attr( 'class' ) }, options ) ) );
            self.$empty_results_container.insertBefore( self.$dropdown );
            self.$empty_results_container.hide();
        };
    })();
});
