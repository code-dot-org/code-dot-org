import PropTypes from 'prop-types';
import React from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import i18n from '@cdo/locale';

export default class LibraryIdCopier extends React.Component {
  static propTypes = {
    channelId: PropTypes.string.isRequired,
  };

  copyChannelId = () => {
    this.channelId.select();
    document.execCommand('copy');
  };

  render() {
    const {channelId} = this.props;
    return (
      <div>
        <input
          type="text"
          ref={channelId => (this.channelId = channelId)}
          onClick={event => event.target.select()}
          readOnly
          value={channelId}
          style={styles.copy}
        />
        <Button
          onClick={this.copyChannelId}
          text={i18n.copyId()}
          style={styles.button}
        />
      </div>
    );
  }
}

const styles = {
  copy: {
    cursor: 'copy',
    width: 250,
    height: 25,
    marginBottom: 0,
  },
  button: {
    marginLeft: 10,
  },
};
