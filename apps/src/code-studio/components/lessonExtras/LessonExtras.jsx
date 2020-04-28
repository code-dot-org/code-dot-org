import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import ProjectWidgetWithData from '@cdo/apps/templates/projects/ProjectWidgetWithData';
import {stageOfBonusLevels} from './shapes';
import LessonExtrasNotification from './LessonExtrasNotification';
import Button from '@cdo/apps/templates/Button';
import SublevelCard from '../SublevelCard';

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
    stageNumber: PropTypes.number.isRequired,
    nextStageNumber: PropTypes.number,
    nextLevelPath: PropTypes.string.isRequired,
    showProjectWidget: PropTypes.bool,
    projectTypes: PropTypes.arrayOf(PropTypes.string),
    bonusLevels: PropTypes.arrayOf(PropTypes.shape(stageOfBonusLevels)),
    sectionId: PropTypes.number,
    showStageExtrasWarning: PropTypes.bool
  };

  render() {
    const {
      stageNumber,
      nextStageNumber,
      nextLevelPath,
      bonusLevels,
      sectionId,
      showProjectWidget,
      projectTypes,
      showStageExtrasWarning
    } = this.props;
    const nextMessage = /stage/.test(nextLevelPath)
      ? i18n.extrasNextLesson({number: nextStageNumber})
      : i18n.extrasNextFinish();

    return (
      <div>
        {showStageExtrasWarning && sectionId && <LessonExtrasNotification />}
        <div style={styles.headerAndButton}>
          <h1 style={styles.header}>
            {i18n.extrasStageNumberCompleted({number: stageNumber})}
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
          <div>
            {bonusLevels[0].levels.map(sublevel => (
              <SublevelCard
                isLessonExtra={true}
                sublevel={sublevel}
                key={sublevel.id}
              />
            ))}
          </div>
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
