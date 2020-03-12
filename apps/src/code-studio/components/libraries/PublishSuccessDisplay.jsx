import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import {Heading2} from '@cdo/apps/lib/ui/Headings';
import LibraryIdCopier from './LibraryIdCopier';

const styles = {
  centerContent: {
    display: 'flex',
    justifyContent: 'center'
  }
};

export default class PublishSuccessDisplay extends React.Component {
  static propTypes = {
    libraryName: PropTypes.string.isRequired,
    channelId: PropTypes.string.isRequired,
    onTeacherShareLibrary: PropTypes.func
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
            <LibraryIdCopier channelId={channelId} />
            {onTeacherShareLibrary && (
              <Button onClick={onTeacherShareLibrary} text={'manage sharing'} />
            )}
          </div>
        </div>
      </div>
    );
  };
}
