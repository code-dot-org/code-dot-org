import React from 'react';
import PropTypes from 'prop-types';
import msg from '@cdo/locale';
import BonusLevels from './BonusLevels';
import ProjectWidgetWithData from '@cdo/apps/templates/projects/ProjectWidgetWithData';
import { bonusLevel } from './shapes';

export default class StageExtras extends React.Component {
  static propTypes = {
    stageNumber: PropTypes.number.isRequired,
    nextLevelPath: PropTypes.string.isRequired,
    showProjectWidget: PropTypes.bool,
    projectTypes: PropTypes.arrayOf(PropTypes.string),
    bonusLevels: PropTypes.arrayOf(PropTypes.shape(bonusLevel)),
  };

  render() {
    const nextMessage = /stage/.test(this.props.nextLevelPath) ?
      msg.extrasNextLesson({number: this.props.stageNumber + 1}) :
      msg.extrasNextFinish();

    return (
      <div>
        <h1>{msg.extrasStageNumberCompleted({number: this.props.stageNumber})}</h1>

        <h2>{msg.extrasTryAChallenge()}</h2>
        {this.props.bonusLevels ?
          <BonusLevels bonusLevels={this.props.bonusLevels}/> :
          <p>{msg.extrasNoBonusLevels()}</p>
        }

        {this.props.showProjectWidget &&
          <ProjectWidgetWithData
            projectTypes={this.props.projectTypes}
          />
        }
        <div className="clear" />

        <h2>{msg.continue()}</h2>
        <a href={this.props.nextLevelPath}>{nextMessage}</a>
      </div>
    );
  }
}
