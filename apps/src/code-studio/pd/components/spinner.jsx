/**
 * Loading spinner.
 */

import React from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

export default class Spinner extends React.Component {
  render() {
    return <FontAwesome icon="spinner" className="fa-pulse fa-3x"/>;
  }
}
