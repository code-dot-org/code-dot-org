import PropTypes from 'prop-types';
import React from 'react';
import msg from '@cdo/locale';
import color from '../../../util/color';
import BonusLevels from './BonusLevels';
import ProjectWidgetWithData from '@cdo/apps/templates/projects/ProjectWidgetWithData';
import {stageOfBonusLevels} from './shapes';

const styles = {
  h2: {
    fontSize: 24,
    fontFamily: '"Gotham 4r"',
    color: color.charcoal
  }
};

export default class StageExtras extends React.Component {
  static propTypes = {
    stageNumber: PropTypes.number.isRequired,
    nextLevelPath: PropTypes.string.isRequired,
    showProjectWidget: PropTypes.bool,
    projectTypes: PropTypes.arrayOf(PropTypes.string),
    bonusLevels: PropTypes.arrayOf(PropTypes.shape(stageOfBonusLevels)),
    sectionId: PropTypes.number,
    userId: PropTypes.number
  };

  render() {
    const {
      stageNumber,
      nextLevelPath,
      bonusLevels,
      sectionId,
      userId,
      showProjectWidget,
      projectTypes
    } = this.props;
    const nextMessage = /stage/.test(nextLevelPath)
      ? msg.extrasNextLesson({number: stageNumber + 1})
      : msg.extrasNextFinish();

    return (
      <div>
        <h1>{msg.extrasStageNumberCompleted({number: stageNumber})}</h1>

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
