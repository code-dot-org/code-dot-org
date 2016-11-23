/**
 * Loading spinner.
 */

import React from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const Spinner = React.createClass({
  render() {
    return <FontAwesome icon="spinner" className="fa-pulse fa-3x"/>;
  }
});
export default Spinner;
