import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

export default class SharePlaceholder extends React.Component {
  static propTypes = {
    analyticsReporter: PropTypes.any.isRequired
  };

  state = {
    shareShowing: false
  };

  shareClicked = () => {
    if (!this.state.shareShowing) {
      this.props.analyticsReporter.onButtonClicked('share');
    }
    this.setState({shareShowing: true});
  };

  render() {
    return (
      <div
        id="share-placeholder"
        onClick={this.shareClicked}
        style={{
          backgroundColor: '#222',
          width: 140,
          borderRadius: 4,
          padding: 10,
          boxSizing: 'border-box',
          position: 'relative',
          textAlign: 'center',
          cursor: this.state.shareShowing ? 'auto' : 'pointer'
        }}
      >
        {!this.state.shareShowing && (
          <div>
            <FontAwesome icon={'share-square-o'} />
            &nbsp; Share
          </div>
        )}
        {this.state.shareShowing && (
          <div>
            <FontAwesome icon={'clock-o'} />
            &nbsp; Sharing is under construction. Check back soon.
          </div>
        )}
      </div>
    );
  }
}
