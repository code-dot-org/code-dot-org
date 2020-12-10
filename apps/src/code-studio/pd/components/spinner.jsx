/**
 * Loading spinner.
 */

import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

export default class Spinner extends React.Component {
  static propTypes = {
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    style: PropTypes.object
  };

  render() {
    const {size, style} = this.props;
    let displaySize =
      size === 'small' ? '' : size === 'medium' ? 'fa-2x' : 'fa-3x';
    return (
      <FontAwesome
        style={style}
        icon="spinner"
        className={`fa-pulse ${displaySize}`}
      />
    );
  }
}
