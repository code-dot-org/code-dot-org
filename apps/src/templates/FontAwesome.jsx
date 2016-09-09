/** @file font-awesome helper component. */

import React from 'react';
import _ from 'lodash';

/**
 * Given an icon name, render the icon using an <i> tag in typical font-awesome
 * fashion.  Requires font-awesome to be available on the page.
 * See http://fontawesome.io/icons/ to look up supported icon names.
 */
export default function FontAwesome({icon, className, ...props}) {
  const newProps = _.assign({}, props, {
    className: `fa fa-${icon} ${className ? className : ''}`
  });
  return <i {...newProps} />;
}

FontAwesome.propTypes = {
  icon: React.PropTypes.string.isRequired,
  className: React.PropTypes.string,
};
