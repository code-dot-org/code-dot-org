import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import {Heading2} from '@cdo/apps/lib/ui/Headings';
import LibraryIdCopier from './LibraryIdCopier';

export default class PublishSuccessDisplay extends React.Component {
  static propTypes = {
    libraryName: PropTypes.string.isRequired,
    channelId: PropTypes.string.isRequired,
    onShareTeacherLibrary: PropTypes.func
  };

  render = () => {
    const {libraryName, channelId, onShareTeacherLibrary} = this.props;
    return (
      <div>
        <Heading2>
          <b>{i18n.libraryPublishTitle()}</b>
          {libraryName}
        </Heading2>
        <div>
          <p>{i18n.libraryPublishExplanation()}</p>
          <div style={styles.centerContent}>
            <LibraryIdCopier channelId={channelId} />
            {onShareTeacherLibrary && (
              <Button
                color={Button.ButtonColor.gray}
                onClick={onShareTeacherLibrary}
                text={i18n.manageLibraries()}
              />
            )}
          </div>
        </div>
      </div>
    );
  };
}

const styles = {
  centerContent: {
    display: 'flex',
    justifyContent: 'center'
  }
};
