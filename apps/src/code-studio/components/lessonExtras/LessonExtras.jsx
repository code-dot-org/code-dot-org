import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import fontConstants from '@cdo/apps/fontConstants';
import ProjectWidgetWithData from '@cdo/apps/templates/projects/ProjectWidgetWithData';
import i18n from '@cdo/locale';

import BonusLevels from './BonusLevels';
import LessonExtrasNotification from './LessonExtrasNotification';
import {lessonOfBonusLevels} from './shapes';

import moduleStyles from './lesson-extras.module.scss';

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
    showLessonExtrasWarning: PropTypes.bool,
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
      showLessonExtrasWarning,
    } = this.props;

    let nextMessage = i18n.extrasNextUnitOverview();

    if (/lessons/.test(nextLevelPath)) {
      nextMessage = i18n.extrasNextLesson({number: nextLessonNumber});
    } else if (/congrats/.test(nextLevelPath)) {
      nextMessage = i18n.extrasNextFinish();
    }

    return (
      <div>
        {showLessonExtrasWarning && sectionId && <LessonExtrasNotification />}
        <div style={styles.headerAndButton}>
          <h1 style={styles.header}>
            {i18n.extrasStageNumberCompleted({number: lessonNumber})}
          </h1>
          <MuiButton
            href={nextLevelPath}
            variant="contained"
            color="primary"
            size="large"
            className={moduleStyles.nextButton}
          >
            {nextMessage}
          </MuiButton>
        </div>

        <div style={styles.subHeader}>{i18n.extrasTryAChallenge()}</div>
        {bonusLevels && Object.keys(bonusLevels).length > 0 ? (
          <BonusLevels
            bonusLevels={bonusLevels}
            sectionId={sectionId}
            userId={userId}
          />
        ) : (
          <p>{i18n.extrasNoBonusLevels()}</p>
        )}

        {showProjectWidget && (
          <ProjectWidgetWithData projectTypes={projectTypes} />
        )}
        <div className="clear" />
      </div>
    );
  }
}

const styles = {
  header: {
    fontSize: 24,
  },
  headerAndButton: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subHeader: {
    fontSize: 24,
    color: 'rgb(91, 103, 112)',
    ...fontConstants['main-font-regular'],
    paddingTop: 10,
    paddingBottom: 20,
  },
};
