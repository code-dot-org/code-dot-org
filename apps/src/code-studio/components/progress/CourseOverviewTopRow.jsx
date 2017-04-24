import React, { PropTypes } from 'react';
import SectionSelector from './SectionSelector';
import experiments from '@cdo/apps/util/experiments';
import i18n from '@cdo/locale';
import ProgressButton from '@cdo/apps/templates/progress/ProgressButton';
import HrefButton from '@cdo/apps/templates/HrefButton';
import ProgressDetailToggle from '@cdo/apps/templates/progress/ProgressDetailToggle';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';

// TODO - get this from redux instead?
import {isRtl} from '@cdo/apps/code-studio/utils';

const progressRedesignEnabled = experiments.isEnabled('progressRedesign');

const styles = {
  buttonRow: {
    // ensure we have height when we only have our toggle (which is floated)
    minHeight: 50
  },
  sectionSelector: {
    // offset selector's margin so that we're aligned flush right
    position: 'relative',
    right: progressRedesignEnabled ? 0 : -10,
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

const CourseOverviewTopRow = React.createClass({
  propTypes: {
    professionalLearningCourse: PropTypes.bool,
    hasLevelProgress: PropTypes.bool.isRequired,
    scriptName: PropTypes.string.isRequired,
    viewAs: React.PropTypes.oneOf(Object.values(ViewType)).isRequired,
  },

  render() {
    const {
      professionalLearningCourse,
      hasLevelProgress,
      scriptName,
      viewAs
    } = this.props;

    let headerButtons;
    if (progressRedesignEnabled) {
      headerButtons = (
        <div>
          <ProgressButton
            href={`/s/${scriptName}/next.next`}
            text={hasLevelProgress ? i18n.continue() : i18n.tryNow()}
            size={ProgressButton.ButtonSize.large}
          />
          <ProgressButton
            href="//support.code.org"
            text={i18n.getHelp()}
            color={ProgressButton.ButtonColor.white}
            size={ProgressButton.ButtonSize.large}
            style={{marginLeft: 10}}
          />
        </div>
      );
    } else {
      headerButtons = (
        <div>
          <HrefButton
            href={`/s/${scriptName}/next.next`}
            text={hasLevelProgress ? i18n.continue() : i18n.tryNow()}
            type="primary"
            style={{marginBottom: 10}}
          />
          <HrefButton
            href="//support.code.org"
            text={i18n.getHelp()}
            type="default"
            style={{marginLeft: 10, marginBottom: 10}}
          />
        </div>
      );
    }

    return (
      <div style={styles.buttonRow}>
        {!professionalLearningCourse && headerButtons}
        <div style={isRtl() ? styles.left : styles.right}>
          {viewAs === ViewType.Teacher &&
            <span style={styles.sectionSelector}>
              <SectionSelector/>
            </span>
          }
          {progressRedesignEnabled && (
            <span>
              <ProgressDetailToggle/>
            </span>
          )}
        </div>
      </div>
    );
  }
});

export default CourseOverviewTopRow;
