import PropTypes from 'prop-types';
import React, {Component} from 'react';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import ProgressLevelSet from '@cdo/apps/templates/progress/ProgressLevelSet';

const styles = {
  progressionBox: {
    borderWidth: 1,
    borderStyle: 'solid',
    margin: 10,
    width: '100%'
  }
};

export default class ProgressionDetails extends Component {
  static propTypes = {
    progression: PropTypes.object
  };

  render() {
    const {progression} = this.props;

    return (
      <div style={styles.progressionBox}>
        <ProgressLevelSet
          name={progression.displayName}
          levels={progression.levels}
          disabled={true}
          selectedSectionId={null}
        />
        <SafeMarkdown markdown={progression.text} />
      </div>
    );
  }
}
