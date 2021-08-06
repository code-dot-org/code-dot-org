import React, {Component} from 'react';
import PropTypes from 'prop-types';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import Button from '@cdo/apps/templates/Button';

export default class PeerSelectDropdown extends Component {
  static propTypes = {
    text: PropTypes.string,
    peers: PropTypes.array,
    onSelectPeer: PropTypes.func
  };

  render() {
    const {text, peers, onSelectPeer} = this.props;
    return (
      <div style={styles.container}>
        <DropdownButton text={text} color={Button.ButtonColor.white}>
          {peers &&
            peers.map(peer => (
              <a
                key={peer.id}
                onClick={() => {
                  onSelectPeer(peer);
                }}
              >
                {peer.name}
              </a>
            ))}
        </DropdownButton>
      </div>
    );
  }
}

const styles = {
  container: {
    display: 'flex'
  }
};
