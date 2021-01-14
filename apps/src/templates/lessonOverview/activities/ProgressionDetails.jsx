import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ProgressLevelSet from '@cdo/apps/templates/progress/ProgressLevelSet';
import color from '@cdo/apps/util/color';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

const styles = {
  progressionBox: {
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    margin: '10px, 0px',
    width: '95%',
    backgroundColor: color.lightest_gray,
    padding: '0px 10px 10px 10px'
  },
  description: {
    marginTop: 10
  }
};

export default class ProgressionDetails extends Component {
  static propTypes = {
    section: PropTypes.object
  };

  convertScriptLevelForProgression = scriptLevel => {
    const activeLevel =
      scriptLevel.levels.length > 1
        ? scriptLevel.levels.filter(level => {
            return level.id === scriptLevel.activeId;
          })[0]
        : scriptLevel.levels[0];

    return {
      // TODO: (charlie) this is temporary backward compatibility with
      // ProgressBubble, which will be updated to use strings for ids
      // in an upcoming PR
      id: parseInt(activeLevel.id),
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
      bonus: scriptLevel.bonus
    };
  };

  render() {
    const {section} = this.props;

    return (
      <div style={styles.progressionBox}>
        <ProgressLevelSet
          name={section.progressionName}
          levels={section.scriptLevels.map(scriptLevel =>
            this.convertScriptLevelForProgression(scriptLevel)
          )}
          disabled={false}
          selectedSectionId={null}
        />
      </div>
    );
  }
}
