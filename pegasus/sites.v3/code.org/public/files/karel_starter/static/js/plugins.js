/* jQuery textarea autogrow plugin */
(function ($) {
    $.fn.autogrow = function (options) {
        this.filter('textarea').each(function () {
            var $this = $(this),
                minHeight = $this.height(),
                lineHeight = $this.css('lineHeight');
            var shadow = $('<div></div>').css({
                position: 'absolute',
                top: -10000,
                left: -10000,
                width: $(this).width(),
                fontSize: $this.css('fontSize'),
                fontFamily: $this.css('fontFamily'),
                lineHeight: $this.css('lineHeight'),
                resize: 'none'
            }).appendTo(document.body);
            var update = function () {
                    var val = this.value.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;').replace(/\n/g, '<br/>');
                    shadow.html(val);
                    $(this).css('height', Math.max(shadow.height() + 20, minHeight));
                }
            $(this).change(update).keyup(update).keydown(update);
            update.apply(this);
        });
        return this;
    }
})(jQuery);


/* Minimizable - jQuery plugin
 * @author  Jeremy Keeshin      July 1, 2012
 *
 * Allow elements to be minimized and maximized easily. This will add a simple
 * icon in the top right corner that toggles whether the element is hidden or 
 * shown. The icon to minimize or maximize the element is added to the title
 * element which is passed in as an option. 
 * 
 * This depends on the tooltip jquery plugin as well.
 *
 * @param   options {Object}    options object
 *  -   title   {string}    selector for the title bar, where the +/- icon is added
 * @return  the jQuery element, so it can be chained
 *
 * Usage:
 *          // This would minimize the .result-image class when clicked
 *          $(".result-image").minimizable({title: ".result-title"});
 *          
 */
 (function($) {

    $.fn.minimizable = function(options){
        var $this = $(this), // The element to be hidden or shown
            $title = $(options.title);

        // Add a button that allows this area to be minimized
        // and maximized.
        var open = options.open == undefined ? true : options.open;
        if (open) {
            var $icon = $('<i class="icon-hide-show icon-minus" rel="tooltip" title="Hide"></i>');
        } else {
            $this.toggle();
            var $icon = $('<i class="icon-hide-show icon-plus" rel="tooltip" title="Show"></i>');            
        }
        $title.append($icon);

        /* Get the icon to show the Hide/Show tooltip */
        $icon.tooltip();

        /* On click, toggle hide or show the main element. */
        $icon.click(function(){
                $this.toggle();
                $icon.tooltip('hide');
                if(open){
                    $icon.removeClass('icon-minus').addClass('icon-plus');
                    $(this).attr('data-original-title', 'Show');
                }else{
                    $icon.removeClass('icon-plus').addClass('icon-minus');
                    $(this).attr('data-original-title', 'Hide');
                }
                open = !open;
        })

        // Keep it chainable
        return this;
    }

 })(jQuery);


 /* Exists -- jQuery plugin
  * Check if element Exists
  * @author Jeremy Keeshin      July 6, 2012
  *
  * Usage:
  *         if($("#my-elem").exists()){ ... }
  */
(function($){

    $.fn.exists = function(){
        return $(this).length > 0;
    }

})(jQuery);


