/**
 * Loading spinner.
 */

import React, {PropTypes} from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

export default class Spinner extends React.Component {
  static propTypes = {
    size: PropTypes.oneOf(['small', 'large'])
  };

  render() {
    return <FontAwesome icon="spinner" className={`fa-pulse ${this.props.size !== 'small' ? 'fa-3x' : ''}`}/>;
  }
}
