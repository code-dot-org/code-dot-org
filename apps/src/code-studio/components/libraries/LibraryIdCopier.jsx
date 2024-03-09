import React from 'react';
import PropTypes from 'prop-types';
import style from './library.module.scss';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';

export default class LibraryIdCopier extends React.Component {
  static propTypes = {
    channelId: PropTypes.string.isRequired,
  };

  copyChannelId = () => {
    this.channelId.select();
    navigator.clipboard.writeText(this.props.channelId);
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
          className={style.idTextbox}
        />
        <Button
          onClick={this.copyChannelId}
          text={i18n.copyId()}
          className={style.copyButton}
        />
      </div>
    );
  }
}
