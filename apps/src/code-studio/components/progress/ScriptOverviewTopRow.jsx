import React, { PropTypes } from 'react';
import SectionSelector from './SectionSelector';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import ProgressDetailToggle from '@cdo/apps/templates/progress/ProgressDetailToggle';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';

const styles = {
  buttonRow: {
    // ensure we have height when we only have our toggle (which is floated)
    minHeight: 50
  },
  sectionSelector: {
    // offset selector's margin so that we're aligned flush right
    position: 'relative',
    right: 0,
    // vertically center
    bottom: 4
  },
  right: {
    position: 'absolute',
    right: 0,
    top: 0
  },
  left: {
    position: 'absolute',
    left: 0,
    top: 0
  }
};

const ScriptOverviewTopRow = React.createClass({
  propTypes: {
    professionalLearningCourse: PropTypes.bool,
    hasLevelProgress: PropTypes.bool.isRequired,
    scriptName: PropTypes.string.isRequired,
    viewAs: React.PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isRtl: React.PropTypes.bool.isRequired,
  },

  render() {
    const {
      professionalLearningCourse,
      hasLevelProgress,
      scriptName,
      viewAs,
      isRtl
    } = this.props;

    return (
      <div style={styles.buttonRow}>
        {!professionalLearningCourse && (
          <div>
            <Button
              href={`/s/${scriptName}/next.next`}
              text={hasLevelProgress ? i18n.continue() : i18n.tryNow()}
              size={Button.ButtonSize.large}
            />
            <Button
              href="//support.code.org"
              text={i18n.getHelp()}
              color={Button.ButtonColor.white}
              size={Button.ButtonSize.large}
              style={{marginLeft: 10}}
            />
          </div>
        )}
        <div style={isRtl ? styles.left : styles.right}>
          {viewAs === ViewType.Teacher &&
            <span style={styles.sectionSelector}>
              <SectionSelector/>
            </span>
          }
          <span>
            <ProgressDetailToggle/>
          </span>
        </div>
      </div>
    );
  }
});

export default ScriptOverviewTopRow;
