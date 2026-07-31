import {Button, Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import LibraryIdCopier from './LibraryIdCopier';

export default class PublishSuccessDisplay extends React.Component {
  static propTypes = {
    libraryName: PropTypes.string.isRequired,
    channelId: PropTypes.string.isRequired,
    onShareTeacherLibrary: PropTypes.func,
  };

  render = () => {
    const {libraryName, channelId, onShareTeacherLibrary} = this.props;
    return (
      <div>
        <Typography variant="h4" gutterBottom>
          {i18n.libraryPublishTitle()}
          {libraryName}
        </Typography>
        <div>
          <Typography variant="body2" gutterBottom>
            {i18n.libraryPublishExplanation()}
          </Typography>
          <div style={styles.centerContent}>
            <LibraryIdCopier channelId={channelId} />
            {onShareTeacherLibrary && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={onShareTeacherLibrary}
              >
                {i18n.manageLibraries()}
              </Button>
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
    justifyContent: 'center',
  },
};
