import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import styles from './library-id-copier.module.scss';

export default class LibraryIdCopier extends React.Component {
  static propTypes = {
    channelId: PropTypes.string.isRequired,
    compact: PropTypes.bool,
  };

  copyChannelId = () => {
    this.channelId.select();
    document.execCommand('copy');
  };

  render() {
    const {channelId, compact} = this.props;
    return (
      <div className={styles.container}>
        <TextField
          name="libraryChannelId"
          className={classNames(styles.copy, {
            [styles.copyCompact]: compact,
          })}
          ref={channelId => (this.channelId = channelId)}
          onClick={event => event.target.select()}
          onChange={() => {}}
          readOnly
          value={channelId}
          size="s"
        />
        <MuiButton
          variant="contained"
          color="primary"
          size="small"
          onClick={this.copyChannelId}
          sx={{marginLeft: '10px', whiteSpace: 'nowrap', flexShrink: 0}}
        >
          {i18n.copyId()}
        </MuiButton>
      </div>
    );
  }
}
