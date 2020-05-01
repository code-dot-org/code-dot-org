import PropTypes from 'prop-types';
import React from 'react';
import msg from '@cdo/locale';
import color from '../../../util/color';
import BonusLevels from './BonusLevels';
import ProjectWidgetWithData from '@cdo/apps/templates/projects/ProjectWidgetWithData';
import {lessonOfBonusLevels} from './shapes';
import LessonExtrasNotification from './LessonExtrasNotification';

const styles = {
  h2: {
    fontSize: 24,
    fontFamily: '"Gotham 4r"',
    color: color.charcoal
  }
};

export default class LessonExtras extends React.Component {
  static propTypes = {
    lessonNumber: PropTypes.number.isRequired,
    nextLessonNumber: PropTypes.number,
    nextLevelPath: PropTypes.string.isRequired,
    showProjectWidget: PropTypes.bool,
    projectTypes: PropTypes.arrayOf(PropTypes.string),
    bonusLevels: PropTypes.arrayOf(PropTypes.shape(lessonOfBonusLevels)),
    sectionId: PropTypes.number,
    userId: PropTypes.number,
    showLessonExtrasWarning: PropTypes.bool
  };

  render() {
    const {
      lessonNumber,
      nextLessonNumber,
      nextLevelPath,
      bonusLevels,
      sectionId,
      userId,
      showProjectWidget,
      projectTypes,
      showLessonExtrasWarning
    } = this.props;
    const nextMessage = /stage/.test(nextLevelPath)
      ? msg.extrasNextLesson({number: nextLessonNumber})
      : msg.extrasNextFinish();

    return (
      <div>
        {showLessonExtrasWarning && sectionId && <LessonExtrasNotification />}

        <h1>{msg.extrasStageNumberCompleted({number: lessonNumber})}</h1>

        <h2 style={styles.h2}>{msg.continue()}</h2>
        <a href={nextLevelPath}>
          <button
            type="button"
            className="btn btn-large btn-primary"
            style={{marginBottom: 20}}
          >
            {nextMessage}
          </button>
        </a>

        {bonusLevels && Object.keys(bonusLevels).length > 0 ? (
          <BonusLevels
            bonusLevels={bonusLevels}
            sectionId={sectionId}
            userId={userId}
          />
        ) : (
          <p>{msg.extrasNoBonusLevels()}</p>
        )}

        {showProjectWidget && (
          <ProjectWidgetWithData projectTypes={projectTypes} />
        )}
        <div className="clear" />
      </div>
    );
  }
}
