import PropTypes from 'prop-types';
import React, {Component} from 'react';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import ProgressLevelSet from '@cdo/apps/templates/progress/ProgressLevelSet';
import color from '@cdo/apps/util/color';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

const styles = {
  progressionBox: {
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    margin: '10px, 0px',
    width: '100%',
    backgroundColor: color.lightest_gray,
    padding: 20
  },
  description: {
    marginTop: 10
  }
};

export default class ProgressionDetails extends Component {
  static propTypes = {
    progression: PropTypes.object
  };

  convertScriptLevelForProgression = scriptLevel => {
    const activeLevel =
      scriptLevel.levels.length > 1
        ? scriptLevel.levels.filter(level => {
            return level.id === scriptLevel.activeId;
          })[0]
        : scriptLevel.levels[0];

    return {
      status: LevelStatus.not_tried,
      url: scriptLevel.url,
      name: activeLevel.name,
      kind: scriptLevel.kind,
      icon: activeLevel.icon,
      isConceptLevel: activeLevel.isConceptLevel,
      isUnplugged: scriptLevel.display_as_unplugged,
      levelNumber: scriptLevel.position,
      bonus: scriptLevel.bonus
    };
  };

  render() {
    const {progression} = this.props;

    return (
      <div style={styles.progressionBox}>
        <ProgressLevelSet
          name={progression.displayName}
          levels={progression.scriptLevels.map(scriptLevel =>
            this.convertScriptLevelForProgression(scriptLevel)
          )}
          disabled={false}
          selectedSectionId={null}
        />
        <div style={styles.description}>
          <SafeMarkdown markdown={progression.text} />
        </div>
      </div>
    );
  }
}
