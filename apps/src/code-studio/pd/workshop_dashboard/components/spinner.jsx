/**
 * Loading spinner.
 */

import React from 'react';
import createReactClass from 'create-react-class';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const Spinner = createReactClass({
  render() {
    return <FontAwesome icon="spinner" className="fa-pulse fa-3x"/>;
  }
});
export default Spinner;
