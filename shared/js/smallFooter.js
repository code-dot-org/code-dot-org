/* global $ */
var smallFooter = exports;

/**
 * Sometimes events get cloned so we can't test identity, but a soft check
 * for same event type/target/timestamp produces the effect we want.
 * @param {Event} eventA
 * @param {Event} eventB
 * @returns {boolean} true if the two events represent the same user interaction.
 */
function areSameEvent(eventA, eventB) {
  return eventA.type === eventB.type &&
          eventA.target === eventB.target &&
          eventA.timeStamp === eventB.timeStamp;
}

/**
 * Bind click handler for a "show flyout" link in the footer, which, when
 * clicked, binds a one-time click handler on body to close the flyout no
 * matter where the next click occurs.  Takes care of appropriate show/hide
 * toggle when clicking on the "show" link twice in a row.
 * @param {EventTarget} showClickTarget - the element which should cause the
 *        flyout to appear on click.
 * @param {function} showAction - callback that actually shows the flyout
 * @param {function} hideAction - callback that actually hides the flyout
 */
function bindFooterShowHideHandlers(showClickTarget, showAction, hideAction) {
  var isShowing = false;

  $(showClickTarget).bind('click', function (showEvent) {
    // Don't show/add handlers when already showing
    if (isShowing) {
      return;
    }

    var hideFlyout = function (hideEvent) {
      // Don't hide / remove handlers on same click that shows flyout
      if (areSameEvent(hideEvent, showEvent)) {
        return;
      }
      hideAction();
      isShowing = false;
      // In handler, unbind one-time listeners
      $(document.body).unbind('click', hideFlyout);
    };

    // Allows a second click on the "show" link to also result in a "hide"
    showAction();
    isShowing = true;
    // Bind one-time listeners
    $(document.body).bind('click', hideFlyout);
  });
}

/**
 * Handle clicks on links in small footer
 */
smallFooter.bindHandlers = function () {
  var smallFooter = document.querySelector('.small-footer');
  if (!smallFooter) {
    return;
  }

  var copyrightLink = smallFooter.querySelector('.copyright-link');
  var copyrightFlyout = document.getElementById('copyright-flyout');
  bindFooterShowHideHandlers(copyrightLink, function () {
    copyrightFlyout.style.display = 'block';
  }, function () {
    copyrightFlyout.style.display = 'none';
  });

  var moreLink = smallFooter.querySelector('.more-link');
  var faGlyph = moreLink.querySelector('.fa');
  var moreMenu = document.getElementById('more-menu');
  bindFooterShowHideHandlers(moreLink, function () {
    moreMenu.style.display = 'block';
    faGlyph.className = faGlyph.className.replace('fa-caret-up', 'fa-caret-down');
  }, function () {
    moreMenu.style.display = 'none';
    faGlyph.className = faGlyph.className.replace('fa-caret-down', 'fa-caret-up');
  });
};

/**
 * Sets the copyright flyout to sit exactly above the footer.
 */
smallFooter.repositionCopyrightFlyout = function () {
  var copyrightFlyout = document.querySelector('#copyright-flyout');
  var smallFooter = document.querySelector('.small-footer');
  if (!(copyrightFlyout && smallFooter)) {
    return;
  }
  copyrightFlyout.style.left = '0';
  copyrightFlyout.style.paddingBottom = smallFooter.offsetHeight + 'px';
};

/**
 * Sets the more-menu size and position to sit above the footer and
 * match its full width.
 */
smallFooter.repositionMoreMenu = function () {
  var smallFooter = document.querySelector('.small-footer');
  var moreMenu = document.querySelector('#more-menu');
  if (!(smallFooter && moreMenu)) {
    return;
  }
  moreMenu.style.bottom = smallFooter.offsetHeight + 'px';
  moreMenu.style.width = smallFooter.offsetWidth + 'px';
};


