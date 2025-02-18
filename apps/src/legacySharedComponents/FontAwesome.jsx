/** @file font-awesome helper component. */
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Given an icon name, render the icon using an <i> tag in typical font-awesome
 * fashion.  Requires font-awesome to be available on the page.
 * See http://fontawesome.io/icons/ to look up supported icon names.
 *
 * @deprecated use DSCO FontAwesomeV6Icon instead
 */
export default function FontAwesome({icon, className, title, ...props}) {
  const newProps = _.assign({}, props, {
    className: `fa fa-${icon} ${className ? className : ''}`,
  });
  return <i {...newProps} title={title} />;
}

FontAwesome.propTypes = {
  icon: PropTypes.string.isRequired,
  className: PropTypes.string,
  title: PropTypes.string,
  // Title should be used for semantic icons. If not given, the screenreader will not read the icon
  // See https://fontawesome.com/docs/web/dig-deeper/accessibility#icons-used-as-semantic-elements
};
