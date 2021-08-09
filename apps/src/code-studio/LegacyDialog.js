import $ from 'jquery';
import debounce from 'lodash/debounce';

function createOpenInNewTabButton(parentElement, link) {
  if (link) {
    parentElement.append(
      $(
        `<div><a target="_blank" href="${link}" rel="noopener noreferrer"></a></div>`
      ).addClass('open-link')
    );
  }
}

/**
 * Adjust the maximum size of the popup's inner scroll area so that the whole popup
 * will fit within the browser viewport.
 * @param {string} scrollableElementSelector - jQuery selector string for scrollable inner
 * element
 */
function sizeDialogToViewport(scrollableElementSelector) {
  var viewportHeight = $(window).height();
  var modalDialog = $('.auto-resize-scrollable').filter(':visible');
  var scrollableElement = modalDialog.find(scrollableElementSelector);

  if (scrollableElement.is('iframe')) {
    scrollableElement.css('height', '');
  } else {
    scrollableElement.css('max-height', '');
  }

  var dialogSize = modalDialog.offset().top + modalDialog.height();

  var desiredSize =
    viewportHeight -
    parseInt(modalDialog.css('padding-bottom'), 10) -
    parseInt(modalDialog.css('margin-bottom'), 10);

  var overflow = dialogSize - desiredSize;
  var scrollableElementHeight = scrollableElement.height() - overflow;
  scrollableElement.css('max-height', scrollableElementHeight);

  if (scrollableElement.is('iframe')) {
    scrollableElement.css('height', scrollableElementHeight);
  } else {
    scrollableElement.css('max-height', scrollableElementHeight);
  }
}

/**
 * Create a custom modal dialog box which takes a configurable options object.
 * Currently supported options include:
 * 'header' and 'body': DOM elements
 * 'redirect': redirect page after the dialog is dismissed (default: no redirect)
 * 'id': id of the dialog (default: none)
 * 'close': whether to show a close 'x' button (default: true)
 * 'width': custom width, to override CSS-specified default
 * 'autoResizeScrollableElement': if selected, makes the specified selector's
 *           element scrollable and auto-resizes dialog to window's dimensions
 */
var LegacyDialog = (module.exports = function(options) {
  // Cache visibility to avoid expensive lookup during debounced window resizing
  this.isVisible = true;

  var body = options.body;
  var header = options.header;

  var close = options.close === undefined ? true : options.close;

  var closeLink = $('<div id="x-close"/>')
    .addClass('x-close')
    .attr('data-dismiss', 'modal');
  this.div = $('<div tabindex="-1"/>').addClass('modal');

  if (options.width) {
    this.div.css({
      width: `${options.width}px`,
      marginLeft: `-${options.width / 2}px`
    });
  }

  this.div.addClass('dash_modal');
  if (options.id) {
    this.div.attr('id', options.id);
  }
  var modalBody = $('<div/>').addClass('modal-body');
  modalBody.addClass('dash_modal_body');

  if (header) {
    var modalHeader = $('<div/>')
      .addClass('modal-header')
      .append(header);
    if (close) {
      modalHeader.append(closeLink);
      createOpenInNewTabButton(modalHeader, options.link);
    }
    this.div.append(modalHeader);
  } else if (close) {
    modalBody.append(closeLink);
    createOpenInNewTabButton(modalBody, options.link);
  }

  modalBody.append(body);
  this.div.append(modalBody).appendTo($(document.body));

  var resizeCallback;
  if (options.autoResizeScrollableElement) {
    this.div.addClass('auto-resize-scrollable');
    var scrollableElement = this.div.find(options.autoResizeScrollableElement);
    scrollableElement.css('overflow-y', 'auto');

    resizeCallback = debounce(
      function() {
        if (!this.isVisible) {
          return;
        }
        sizeDialogToViewport(options.autoResizeScrollableElement);
      }.bind(this),
      250
    );

    this.div.find('img').load(resizeCallback);
    $(window).on('resize', resizeCallback);
    resizeCallback();
  }

  // When the dialog is hidden, unhook the keydown event handler.
  // If onHidden option is passed in, call that as well.
  // If redirect option is passed in, redirect the page.
  // After that, close the dialog.
  var thisDialog = this;
  $(this.div).on('hidden.bs.modal', function() {
    if (resizeCallback) {
      thisDialog.isVisible = false;
      $(window).off('resize', resizeCallback);
    }

    if (options.onKeydown) {
      $(this.div).off('keydown', options.onKeydown);
    }
    if (options.onHidden) {
      options.onHidden();
    }
    if (options.redirect) {
      window.location.href = options.redirect;
    }
    $(this).remove();
  });

  $(this.div).on(
    'hide.bs.modal',
    function(e) {
      if (this.hideOptions) {
        // Let's have the dialog object handle hide options.
        this.processHideOptions(this.hideOptions);

        // Tell bootstrap modal dialog system not to remove this dialog yet.
        e.preventDefault();

        // Remove the options from dialog object so that when this event is called again at the
        // end of the processing of hide options, we will just let bootstrap's modal dialog
        // system clean it up like normal.
        this.hideOptions = null;
      }
    }.bind(this)
  );

  if (options.onKeydown) {
    $(this.div).on('keydown', options.onKeydown);
  }
});

/**
 * Options is configurable with a top and left properties, both are integers.
 * Also includes staticBackdrop.  When true, modal dialog's backdrop will not
 * close the dialog when clicked.
 * The caller can also specify hideOptions, for special behavior when the dialog is dismissed.
 */
LegacyDialog.prototype.show = function(options) {
  options = options || {};

  $(this.div).modal({
    show: true,
    // The default value for backdrop is true, meaning clicking the backdrop
    // will close the modal. A value of 'static' will not close the modal.
    backdrop: options.backdrop || true
  });

  this.isVisible = true;

  // Store hideOptions for later use when the dialog is dismissed, inside the div itself.
  if (options.hideOptions) {
    this.hideOptions = options.hideOptions;
  }

  this.div.offset(options);
};

LegacyDialog.prototype.hide = function() {
  $(this.div).modal('hide');
  this.isVisible = false;
};

LegacyDialog.prototype.focus = function() {
  if (this.isVisible) {
    $(this.div).focus();
  }
};

/**
 * This processes optional hideOptions that were provided to show().
 * At the moment it will play an animation of the dialog moving and resizing to
 * the location and dimensions of a specified div, while also fading out.
 * Certain elements are faded out more quickly so that they are gone before
 * the dialog gets too small.
 */
LegacyDialog.prototype.processHideOptions = function(options) {
  var startCss = {};
  startCss.opacity = '1';
  startCss.left = this.div.css('left');
  startCss.top = this.div.css('top');
  startCss.width = this.div.css('width');
  startCss.height = this.div.css('height');

  // The dialog current is 640px wide but has a left margin of -320px.  We need to
  // compensate for that when determining where the animation should end at.
  var marginLeft = parseInt(this.div.css('marginLeft'));

  var endCss = {};
  endCss.opacity = '0';
  endCss.overflow = 'visible';
  endCss.left = $(options.endTarget).offset().left - marginLeft;
  endCss.top = $(options.endTarget).offset().top - $(window).scrollTop();
  endCss.width = $(options.endTarget).css('width');
  endCss.height = $(options.endTarget).css('height');

  // Fade the whole thing out slowly.
  var totalFadeTime = 500;

  // Fade some of the decorative elements quickly.
  var decorationFadeTime = 150;

  // Fade some elements really fast.
  var fastFadeTime = 50;

  // Let's also fade the background out.
  $('.modal-backdrop').animate({opacity: 0}, totalFadeTime);

  // And a bunch of other elements
  this.div.find('.farSide').animate({opacity: 0}, decorationFadeTime);
  this.div.find('#x-close').animate({opacity: 0}, decorationFadeTime);
  this.div.find('.dialog-title').animate({opacity: 0}, decorationFadeTime);
  this.div.find('.aniGif').animate({opacity: 0}, decorationFadeTime);
  this.div
    .find('.modal-content p')
    .animate({'font-size': '13px'}, totalFadeTime);
  this.div
    .find('.markdown-instructions-container')
    .animate({opacity: 0}, fastFadeTime);

  // Slide the instruction box from its current position to its destination.
  $(this.div)
    .css(startCss)
    .animate(endCss, totalFadeTime, 'swing', function() {
      // Just hide the dialog at the end.
      $(this).modal('hide');
    });
};
