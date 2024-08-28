/** @file Button that continues to the next puzzle when clicked */
import React from 'react';

import i18n from '@cdo/locale';

import * as dialogHelper from '../code-studio/levels/dialogHelper';

export default class ContinueButton extends React.Component {
  state = {
    submitting: false,
  };

  onClick = () => {
    this.setState({submitting: true});
    dialogHelper.processResults(willRedirect => {
      if (!willRedirect) {
        this.setState({submitting: false});
      }
    });
  };

  render() {
    const {submitting} = this.state;
    return (
      <button
        type="button"
        className="btn btn-primary pull-right"
        disabled={submitting}
        onClick={submitting ? null : this.onClick}
      >
        {i18n.continue()}
      </button>
    );
  }
}
