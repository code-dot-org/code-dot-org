import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ProgressLevelSet from '@cdo/apps/templates/progress/ProgressLevelSet';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import LevelDetailsDialog from './LevelDetailsDialog';
import firehoseClient from '@cdo/apps/lib/util/firehose';

export default class ProgressionDetails extends Component {
  static propTypes = {
    section: PropTypes.object
  };

  state = {
    previewingLevel: null
  };

  handleBubbleClick = level => {
    this.setState({previewingLevel: level});
    firehoseClient.putRecord(
      {
        study: 'lesson-plan',
        study_group: 'teacher-lesson-plan',
        event: 'click-level-preview',
        data_json: JSON.stringify({
          scriptLevelId: level.id
        })
      },
      {includeUserId: true}
    );
  };

  convertScriptLevelForProgression = scriptLevel => {
    const subLevelsForProgression = scriptLevel.sublevels
      ? scriptLevel.sublevels.map(l => {
          l.isSublevel = true;
          return l;
        })
      : undefined;
    const activeLevel =
      scriptLevel.levels.length > 1
        ? scriptLevel.levels.filter(level => {
            return level.id === scriptLevel.activeId;
          })[0]
        : scriptLevel.levels[0];
    return {
      id: activeLevel.id,
      status: LevelStatus.not_tried,
      url: scriptLevel.url,
      name: this.props.section.progressionName
        ? this.props.section.progressionName
        : activeLevel.name,
      kind: scriptLevel.kind,
      icon: activeLevel.icon,
      isConceptLevel: activeLevel.isConceptLevel,
      isUnplugged: scriptLevel.display_as_unplugged,
      levelNumber: scriptLevel.levelNumber,
      bonus: scriptLevel.bonus,
      level: activeLevel,
      sublevels: subLevelsForProgression
    };
  };

  render() {
    const {section} = this.props;

    return (
      <div>
        {this.state.previewingLevel && (
          <LevelDetailsDialog
            scriptLevel={this.state.previewingLevel}
            handleClose={() => this.setState({previewingLevel: null})}
          />
        )}
        <div style={styles.progressionBox}>
          <ProgressLevelSet
            name={section.progressionName}
            levels={section.scriptLevels.map(scriptLevel =>
              this.convertScriptLevelForProgression(scriptLevel)
            )}
            disabled={false}
            selectedSectionId={null}
            onBubbleClick={this.handleBubbleClick}
          />
        </div>
      </div>
    );
  }
}

const styles = {
  progressionBox: {
    margin: '10px, 0px',
    padding: '0px 10px 10px 10px'
  },
  description: {
    marginTop: 10
  }
};
