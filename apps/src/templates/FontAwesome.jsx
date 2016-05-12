/** @file font-awesome helper component. */
'use strict';

/**
 * Given an icon name, render the icon using an <i> tag in typical font-awesome
 * fashion.  Requires font-awesome to be available on the page.
 * See http://fontawesome.io/icons/ to look up supported icon names.
 */
export default function FontAwesome(props) {
  return <i className={`fa fa-${props.icon}`} />;
}

FontAwesome.propTypes = {
  icon: React.PropTypes.string.isRequired
};
