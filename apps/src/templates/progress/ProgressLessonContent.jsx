import PropTypes from 'prop-types';
import React from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

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
    const {description, levels} = this.props;

    return (
      <div>
        {description && (
          <div style={styles.summary}>
            <SafeMarkdown markdown={description} />
          </div>
        )}
        {levels.length === 0 && (
          <span style={styles.noLevelsWarning}>
            {i18n.lessonContainsNoLevels()}
          </span>
        )}
      </div>
    );
  }
}

const styles = {
  summary: {
    marginTop: 20,
    marginBottom: 30,
    fontSize: 14,
    ...fontConstants['main-font-regular'],
  },
  noLevelsWarning: {
    fontSize: 13,
  },
};
