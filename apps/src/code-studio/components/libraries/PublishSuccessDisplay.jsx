import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import {Heading2} from '@cdo/apps/lib/ui/Headings';

const styles = {
  centerContent: {
    display: 'flex',
    justifyContent: 'center'
  },
  copy: {
    cursor: 'copy',
    width: 300,
    height: 25
  },
  button: {
    marginLeft: 10,
    marginRight: 10
  }
};

export default class PublishSuccessDisplay extends React.Component {
  static propTypes = {
    libraryName: PropTypes.string.isRequired,
    channelId: PropTypes.string.isRequired,
    onTeacherShareLibrary: PropTypes.func
  };

  copyChannelId = () => {
    this.channelId.select();
    document.execCommand('copy');
  };

  render = () => {
    const {libraryName, channelId, onTeacherShareLibrary} = this.props;
    return (
      <div>
        <Heading2>
          <b>{i18n.libraryPublishTitle()}</b>
          {libraryName}
        </Heading2>
        <div>
          <p>{i18n.libraryPublishExplanation()}</p>
          <div style={styles.centerContent}>
            <input
              type="text"
              ref={channelId => (this.channelId = channelId)}
              onClick={event => event.target.select()}
              readOnly="true"
              value={channelId}
              style={styles.copy}
            />
            <Button
              onClick={this.copyChannelId}
              text={i18n.copyId()}
              style={styles.button}
            />
            {onTeacherShareLibrary && (
              <Button
                onClick={onTeacherShareLibrary}
                text={'manage sharing'}
              />
            )}
          </div>
        </div>
      </div>
    );
  };
}
