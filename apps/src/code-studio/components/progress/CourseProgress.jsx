import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import _ from 'lodash';

import { stageShape } from './types';
import CourseProgressRow from './CourseProgressRow.jsx';
import HrefButton from '@cdo/apps/templates/HrefButton';
import ProgressButton from '@cdo/apps/templates/progress/ProgressButton';
import SectionSelector from './SectionSelector';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import color from "@cdo/apps/util/color";
import i18n from '@cdo/locale';
import experiments from '@cdo/apps/util/experiments';
import ProgressTable from '@cdo/apps/templates/progress/ProgressTable';
import ProgressDetailToggle from '@cdo/apps/templates/progress/ProgressDetailToggle';

const styles = {
  buttonRow: {
    // ensure we have height when we only have our toggle (which is floated)
    minHeight: 50
  },
  flexHeader: {
    padding: '8px 11px',
    margin: '20px 0 0 0',
    borderRadius: 5,
    background: color.cyan,
    color: color.white
  },
  right: {
    position: 'absolute',
    right: 0,
    top: 0
  },
  sectionSelector: {
    // offset selector's margin so that we're aligned flush right
    position: 'relative',
    right: experiments.isEnabled('progressRedesign') ? 0 : -10,
    // vertically center
    bottom: 4
  }
};

/**
 * Stage progress component used in level header and course overview.
 */
const CourseProgress = React.createClass({
  propTypes: {
    onOverviewPage: React.PropTypes.bool.isRequired,

    // redux provided
    perLevelProgress: React.PropTypes.object.isRequired,
    scriptName: React.PropTypes.string.isRequired,
    professionalLearningCourse: React.PropTypes.bool,
    focusAreaPositions: React.PropTypes.arrayOf(React.PropTypes.number),
    stages: React.PropTypes.arrayOf(stageShape),
    peerReviewStage: stageShape,
    viewAs: React.PropTypes.oneOf(Object.values(ViewType)).isRequired,
  },

  render() {
    const {
      stages,
      peerReviewStage,
      professionalLearningCourse,
      focusAreaPositions,
      scriptName,
      viewAs
    } = this.props;
    const groups = _.groupBy(stages, stage => (stage.flex_category || 'Content'));
    const showGroupHeaders = _.size(groups) > 1;
    // Add an additional group for any peer reviews
    if (peerReviewStage) {
      // peerReviewStage.flex_category will always be "Peer Review" here
      groups[peerReviewStage.flex_category] = [peerReviewStage];
    }

    let count = 1;

    const hasLevelProgress = Object.keys(this.props.perLevelProgress).length > 0;

    const progressRedesign = experiments.isEnabled('progressRedesign');
    let headerButtons;
    if (progressRedesign) {
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
      <div>
        {this.props.onOverviewPage && (
          <div style={styles.buttonRow}>
            {!this.props.professionalLearningCourse && headerButtons}
            <div style={styles.right}>
              {viewAs === ViewType.Teacher &&
                <span style={styles.sectionSelector}>
                  <SectionSelector/>
                </span>
              }
              {progressRedesign && (
                <span>
                  <ProgressDetailToggle/>
                </span>
              )}
            </div>
          </div>
        )}

        {progressRedesign && <ProgressTable/>}

        {!progressRedesign && <div className="user-stats-block">
          {_.map(groups, (stages, group) =>
            <div key={group}>
              {showGroupHeaders &&
                <h4
                  id={group.toLowerCase().replace(' ', '-')}
                  style={[
                    styles.flexHeader,
                    !professionalLearningCourse && {background: color.purple},
                    count === 1 && {margin: '2px 0 0 0'}
                  ]}
                >
                  {group}
                </h4>
              }
              {stages.map(stage =>
                <CourseProgressRow
                  stage={stage}
                  key={stage.name}
                  isFocusArea={focusAreaPositions.indexOf(count++) > -1}
                  professionalLearningCourse={professionalLearningCourse}
                />
              )}
            </div>
          )}
        </div>
        }
      </div>
    );
  }
});

export default connect(state => ({
  perLevelProgress: state.progress.levelProgress,
  scriptName: state.progress.scriptName,
  professionalLearningCourse: state.progress.professionalLearningCourse,
  focusAreaPositions: state.progress.focusAreaPositions,
  stages: state.progress.stages,
  peerReviewStage: state.progress.peerReviewStage,
  viewAs: state.stageLock.viewAs
}))(Radium(CourseProgress));
