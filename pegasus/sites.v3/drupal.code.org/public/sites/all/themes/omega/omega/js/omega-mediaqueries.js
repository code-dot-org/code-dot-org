/**
 * @todo
 */

Drupal.omega = Drupal.omega || {};

(function($) {
  /**
   * @todo
   */
  var current;
  var previous;
  
  /**
   * @todo
   */
  var setCurrentLayout = function (index) {
    index = parseInt(index);
    previous = current;
    current = Drupal.settings.omega.layouts.order.hasOwnProperty(index) ? Drupal.settings.omega.layouts.order[index] : 'mobile';

    if (previous != current) {      
      $('body').removeClass('responsive-layout-' + previous).addClass('responsive-layout-' + current);      
      $.event.trigger('responsivelayout', {from: previous, to: current});
    }
  };
  
  /**
   * @todo
   */
  Drupal.omega.getCurrentLayout = function () {
    return current;
  };
  
  /**
   * @todo
   */
  Drupal.omega.getPreviousLayout = function () {
    return previous;
  };
  
  /**
   * @todo
   */
  Drupal.omega.crappyBrowser = function () {
    return $.browser.msie && parseInt($.browser.version, 10) < 9;
  };
  
  /**
   * @todo
   */
  Drupal.omega.checkLayout = function (layout) {
    if (Drupal.settings.omega.layouts.queries.hasOwnProperty(layout) && Drupal.settings.omega.layouts.queries[layout]) {
      var output = Drupal.omega.checkQuery(Drupal.settings.omega.layouts.queries[layout]);
      
      if (!output && layout == Drupal.settings.omega.layouts.primary) {
        var dummy = $('<div id="omega-check-query"></div>').prependTo('body');       

        dummy.append('<style media="all">#omega-check-query { position: relative; z-index: -1; }</style>');
        dummy.append('<!--[if (lt IE 9)&(!IEMobile)]><style media="all">#omega-check-query { z-index: 100; }</style><![endif]-->');
        
        output = parseInt(dummy.css('z-index')) == 100;

        dummy.remove();
      }
      
      return output;
    }

    return false;
  };
  
  /**
   * @todo
   */
  Drupal.omega.checkQuery = function (query) {
    var dummy = $('<div id="omega-check-query"></div>').prependTo('body');       
    
    dummy.append('<style media="all">#omega-check-query { position: relative; z-index: -1; }</style>');
    dummy.append('<style media="' + query + '">#omega-check-query { z-index: 100; }</style>');

    var output = parseInt(dummy.css('z-index')) == 100;
    
    dummy.remove();

    return output;
  };
  
  /**
   * @todo
   */
  Drupal.behaviors.omegaMediaQueries = {
    attach: function (context) {
      $('body', context).once('omega-mediaqueries', function () {
        var primary = $.inArray(Drupal.settings.omega.layouts.primary, Drupal.settings.omega.layouts.order);
        var dummy = $('<div id="omega-media-query-dummy"></div>').prependTo('body');

        dummy.append('<style media="all">#omega-media-query-dummy { position: relative; z-index: -1; }</style>');
        dummy.append('<!--[if (lt IE 9)&(!IEMobile)]><style media="all">#omega-media-query-dummy { z-index: ' + primary + '; }</style><![endif]-->');

        for (var i in Drupal.settings.omega.layouts.order) {
          dummy.append('<style media="' + Drupal.settings.omega.layouts.queries[Drupal.settings.omega.layouts.order[i]] + '">#omega-media-query-dummy { z-index: ' + i + '; }</style>');
        }

        $(window).bind('resize.omegamediaqueries', function () {
          setCurrentLayout(dummy.css('z-index'));
        }).load(function () {
          $(this).trigger('resize.omegamediaqueries');
        });
      });
    }
  };
})(jQuery);
