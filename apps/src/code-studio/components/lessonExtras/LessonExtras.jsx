import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import ProjectWidgetWithData from '@cdo/apps/templates/projects/ProjectWidgetWithData';
import {lessonOfBonusLevels} from './shapes';
import LessonExtrasNotification from './LessonExtrasNotification';
import Button from '@cdo/apps/templates/Button';
import BonusLevels from './BonusLevels';

const styles = {
  header: {
    fontSize: 24
  },
  headerAndButton: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  button: {
    margin: '10px 0px'
  },
  subHeader: {
    fontSize: 24,
    color: 'rgb(91, 103, 112)',
    fontFamily: 'Gotham 4r',
    fontWeight: 'normal',
    fontStyle: 'normal',
    paddingTop: 10,
    paddingBottom: 20
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
      ? i18n.extrasNextLesson({number: nextLessonNumber})
      : i18n.extrasNextFinish();

    return (
      <div>
        {showLessonExtrasWarning && sectionId && <LessonExtrasNotification />}
        <div style={styles.headerAndButton}>
          <h1 style={styles.header}>
            {i18n.extrasStageNumberCompleted({number: lessonNumber})}
          </h1>
          <Button
            __useDeprecatedTag
            href={nextLevelPath}
            text={nextMessage}
            size={Button.ButtonSize.large}
            color={Button.ButtonColor.orange}
            style={styles.button}
          />
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
