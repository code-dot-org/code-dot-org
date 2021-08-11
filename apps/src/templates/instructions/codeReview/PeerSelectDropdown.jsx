import React from 'react';
import PropTypes from 'prop-types';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import Button from '@cdo/apps/templates/Button';

const PeerSelectDropdown = ({text, peers, onSelectPeer}) => (
  <div style={styles.container}>
    <DropdownButton text={text} color={Button.ButtonColor.white}>
      {peers.map(peer => (
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

PeerSelectDropdown.propTypes = {
  text: PropTypes.string,
  peers: PropTypes.array.isRequired,
  onSelectPeer: PropTypes.func
};

const styles = {
  container: {
    display: 'flex'
  }
};

export default PeerSelectDropdown;
