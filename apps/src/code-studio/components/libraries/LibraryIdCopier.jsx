import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

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
      <div style={styles.container}>
        <TextField
          name="libraryChannelId"
          ref={channelId => (this.channelId = channelId)}
          onClick={event => event.target.select()}
          onChange={() => {}}
          readOnly
          value={channelId}
          size="s"
          style={styles.copy}
        />
        <MuiButton
          variant="contained"
          color="primary"
          size="small"
          onClick={this.copyChannelId}
          sx={{marginLeft: '10px'}}
        >
          {i18n.copyId()}
        </MuiButton>
      </div>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
  },
  copy: {
    cursor: 'copy',
    width: 250,
  },
};
