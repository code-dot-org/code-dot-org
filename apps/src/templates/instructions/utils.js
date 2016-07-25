import ReactDOM from 'react-dom';

/**
 * @param {ReactComponent} component
 * @param {boolean} includeMargin
 * @returns {number} The current computed height in pixels of the specified component,
 * including padding, border, and (optionally) margins.
 */
export function getOuterHeight(component, includeMargin=false) {
  return $(ReactDOM.findDOMNode(component)).outerHeight(includeMargin);
}

/**
 * Manually scrolls the specified element by the specified delta
 * @param {Element} element The element to scroll
 * @param {number} deltaY The distance (positive or negative) in pixels
 *        to scroll by
 * @param {number} animate If specified, the animation time in ms
 */
export function scrollBy(element, deltaY, animate=400) {
  const newScrollTop = element.scrollTop + deltaY;
  scrollTo(element, newScrollTop, animate);
}

export function scrollTo(element, scrollTop, animate=400) {
  if (animate) {
    let $elem = $(element);
    if (!$elem.is(':animated')) {
      $elem.animate({
        scrollTop: scrollTop
      }, animate);
    }
  } else {
    element.scrollTop = scrollTop;
  }
}

export function shouldDisplayChatTips(skinId) {
  /*eslint-disable no-fallthrough*/
  switch (skinId) {
    case 'infinity':
    case 'anna':
    case 'elsa':
    case 'craft':
    // star wars
    case 'hoc2015':
    case 'hoc2015x':
      return false;
    default:
      return true;
  }
  /*eslint-enable no-fallthrough*/
}
