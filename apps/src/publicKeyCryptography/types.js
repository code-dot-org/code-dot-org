/** @file React PropTypes definitions for use in cryptography widget components */
import {PropTypes} from 'react';
export const AnyChildren = PropTypes.oneOfType([
  PropTypes.node,
  PropTypes.arrayOf(PropTypes.node)
]);
