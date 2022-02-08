import React, {Component} from 'react';
import PropTypes from 'prop-types';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import Button from '@cdo/apps/templates/Button';
import javalabMsg from '@cdo/javalab/locale';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';

class ReviewNavigator extends Component {
  static propTypes = {
    onSelectPeer: PropTypes.func,
    onReturnToProject: PropTypes.func,
    viewPeerList: PropTypes.bool,
    loadPeers: PropTypes.func
  };

  state = {
    peers: [],
    loadError: false,
    loadInProgress: false
  };

  onDropdownClick = () => {
    this.setState({loadInProgress: true, loadError: false, peers: []});
    this.props.loadPeers(this.onPeerLoadSuccess, this.onPeerLoadFailure);
  };

  onPeerLoadSuccess = peerList => {
    this.setState({peers: peerList, loadInProgress: false});
  };

  onPeerLoadFailure = () => {
    this.setState({loadError: true, loadInProgress: false});
  };

  getPeerList() {
    const {onSelectPeer} = this.props;
    const {loadError, peers, loadInProgress} = this.state;
    if (loadInProgress) {
      return [
        <a key="loading" onClick={() => {}}>
          <Spinner size="medium" />
        </a>
      ];
    }
    if (loadError || !Array.isArray(peers)) {
      return [
        <a key="error" onClick={() => {}}>
          {javalabMsg.errorLoadingClassmates()}
        </a>
      ];
    } else if (peers.length === 0) {
      return [
        <a key="no-reviews" onClick={() => {}} className="code-review-no-peers">
          {javalabMsg.noOtherReviews()}
        </a>
      ];
    } else {
      return peers.map(peer => (
        <a
          key={peer.id}
          onClick={() => {
            onSelectPeer(peer);
          }}
          className="code-review-peer-link"
        >
          {peer.name}
        </a>
      ));
    }
  }

  render() {
    const {onReturnToProject, viewPeerList} = this.props;
    return viewPeerList ? (
      <div style={styles.container}>
        <DropdownButton
          text={javalabMsg.reviewClassmateProject()}
          color={Button.ButtonColor.white}
          onClick={this.onDropdownClick}
          className="peer-dropdown-button"
        >
          {this.getPeerList()}
        </DropdownButton>
      </div>
    ) : (
      <Button
        text={javalabMsg.returnToMyProject()}
        color={Button.ButtonColor.white}
        icon={'caret-left'}
        size={Button.ButtonSize.default}
        iconStyle={styles.backToProjectIcon}
        onClick={onReturnToProject}
        style={styles.backToProjectButton}
      />
    );
  }
}

const styles = {
  container: {
    display: 'flex'
  },
  backToProjectIcon: {
    // The back to project icon is styled to be the same size and placement
    // as the dropdown icon (see Dropdown.js)
    fontSize: 24,
    position: 'relative',
    top: 3
  },
  backToProjectButton: {
    margin: 0,
    paddingTop: 0
  }
};

export default ReviewNavigator;
