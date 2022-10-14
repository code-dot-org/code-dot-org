import React from 'react';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

export default class SharePlaceholder extends React.Component {
  state = {
    shareShowing: false
  };

  shareClicked = () => {
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
          height: '100%',
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
