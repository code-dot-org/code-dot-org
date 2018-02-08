import React, {PropTypes} from 'react';
import msg from '@cdo/locale';
import color from "../../../util/color";
import BonusLevels from './BonusLevels';
import ProjectWidgetWithData from '@cdo/apps/templates/projects/ProjectWidgetWithData';
import { stageOfBonusLevels } from './shapes';

const styles = {
  h2: {
    fontSize: 24,
    fontFamily: '"Gotham 4r"',
    color: color.charcoal,
  },
};

export default class StageExtras extends React.Component {
  static propTypes = {
    stageNumber: PropTypes.number.isRequired,
    nextLevelPath: PropTypes.string.isRequired,
    showProjectWidget: PropTypes.bool,
    projectTypes: PropTypes.arrayOf(PropTypes.string),
    bonusLevels: PropTypes.arrayOf(PropTypes.shape(stageOfBonusLevels)),
  };

  render() {
    const nextMessage = /stage/.test(this.props.nextLevelPath) ?
      msg.extrasNextLesson({number: this.props.stageNumber + 1}) :
      msg.extrasNextFinish();

    return (
      <div>
        <h1>{msg.extrasStageNumberCompleted({number: this.props.stageNumber})}</h1>

        <h2 style={styles.h2}>{msg.continue()}</h2>
        <a href={this.props.nextLevelPath}>
          <button
            className="btn btn-large btn-primary"
            style={{ marginBottom: 20 }}
          >
            {nextMessage}
          </button>
        </a>

        {(this.props.bonusLevels && Object.keys(this.props.bonusLevels).length > 0) ?
          <BonusLevels bonusLevels={this.props.bonusLevels}/> :
          <p>{msg.extrasNoBonusLevels()}</p>
        }

        {this.props.showProjectWidget &&
          <ProjectWidgetWithData
            projectTypes={this.props.projectTypes}
          />
        }
        <div className="clear" />
      </div>
    );
  }
}
