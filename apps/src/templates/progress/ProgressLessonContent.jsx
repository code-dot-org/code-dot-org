import {Typography} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import {progressionsFromLevels} from '@cdo/apps/code-studio/progressReduxSelectors';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import ProgressBubbleSet from './ProgressBubbleSet';
import ProgressLevelSet from './ProgressLevelSet';
import {levelWithProgressType} from './progressTypes';

export default class ProgressLessonContent extends React.Component {
  static propTypes = {
    description: PropTypes.string,
    levels: PropTypes.arrayOf(levelWithProgressType).isRequired,
    disabled: PropTypes.bool.isRequired,
    selectedSectionId: PropTypes.number,
    lessonName: PropTypes.string,
  };

  render() {
    const {description, levels, disabled, selectedSectionId, lessonName} =
      this.props;
    const progressions = progressionsFromLevels(levels);

    let bubbles;
    if (progressions.length === 0) {
      bubbles = (
        <Typography variant="body4" component="span">
          {i18n.lessonContainsNoLevels()}
        </Typography>
      );
    } else if (progressions.length === 1 && !progressions[0].name) {
      bubbles = (
        <ProgressBubbleSet
          levels={progressions[0].levels}
          disabled={disabled}
          selectedSectionId={selectedSectionId}
        />
      );
    } else {
      bubbles = progressions.map((progression, index) => (
        <ProgressLevelSet
          key={index}
          name={progression.displayName}
          lessonName={lessonName}
          levels={progression.levels}
          disabled={disabled}
          selectedSectionId={selectedSectionId}
        />
      ));
    }

    return (
      <div>
        {description && (
          <Typography
            variant="body3"
            component="div"
            sx={{marginTop: '20px', marginBottom: '30px'}}
          >
            <SafeMarkdown markdown={description} />
          </Typography>
        )}
        <div> {bubbles} </div>
      </div>
    );
  }
}
