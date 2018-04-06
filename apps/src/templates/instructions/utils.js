import ReactDOM from 'react-dom';
import $ from 'jquery';

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

/**
 * Converts any inline XML in the container element into embedded
 * readonly BlockSpaces
 * @param {Element} container The element in which to search for XML
 */
export function convertXmlToBlockly(container) {
  const xmls = container.getElementsByTagName('xml');
  Array.prototype.forEach.call(xmls, function (xml) {
    // embedded blocks can be displayed either "inline" as part of a paragraph
    // or "block" all on their own. "block" is the default.
    const inline = xml.parentNode.tagName === "P";

    // create a container and insert the blockspace into it
    const container = document.createElement(inline ? 'span' : 'div');
    if (inline) {
      // SVGs don't play nicely if they're rendered into purely inline elements,
      // so if our container is a span it should be inline-block
      container.style.display = "inline-block";
    }
    xml.parentNode.insertBefore(container, xml);
    const blockSpace = Blockly.BlockSpace.createReadOnlyBlockSpace(container, xml, {
      noScrolling: true,
      inline: inline
    });

    // then, calculate the minimum required size for the container
    const metrics = blockSpace.getMetrics();
    let height = metrics.contentHeight;
    let width = metrics.contentWidth;

    // give block embeds more padding than inline
    if (!inline) {
      height += metrics.contentTop * 2;
      width += metrics.contentLeft;
    }

    // and shrink it, triggering a blockspace resize when we do so
    container.style.height = height + "px";
    container.style.width = width + "px";
    blockSpace.blockSpaceEditor.svgResize();
  });
}

export function shouldDisplayChatTips(skinId) {
  /*eslint-disable no-fallthrough*/
  switch (skinId) {
    // skins without avatars
    case 'calc':
    case 'eval':
    case 'jigsaw':
    // skins with licensed avatars
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
