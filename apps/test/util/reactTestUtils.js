import Portal from 'react-portal';
import {ReactWrapper} from 'enzyme';

/**
 * @param {ReactWrapper} wrapper - enzyme wrapper containing a mounted Portal component
 * @returns ReactWrapper - the content of the portal
 */
export function getPortalContent(wrapper) {
  const portal = wrapper.find(Portal);
  if (portal.length > 0) {
    const contentNode = portal.node.portal;
    if (contentNode) {
      return new ReactWrapper(contentNode, contentNode);
    }
  }
  return null;
}
