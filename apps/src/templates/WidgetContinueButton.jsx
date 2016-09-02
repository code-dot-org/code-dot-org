/** @file Button that continues to the next puzzle when clicked */
/* global dashboard */
import React from 'react';
import i18n from '@cdo/locale';

const ContinueButton = React.createClass({
  getInitialState() {
    return {submitting: false};
  },

  onClick() {
    this.setState({submitting: true});
    dashboard.dialog.processResults(willRedirect => {
      if (!willRedirect) {
        this.setState({submitting: false});
      }
    });
  },

  render() {
    return (
      <button
        className="btn btn-primary pull-right"
        disabled={!!this.state.submitting}
        onClick={this.state.submitting ? null : this.onClick}
      >
        {i18n.continue()}
      </button>
    );
  }
});
export default ContinueButton;
