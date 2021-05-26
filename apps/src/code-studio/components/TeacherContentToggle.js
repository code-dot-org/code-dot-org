import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {connect} from 'react-redux';
import {ViewType} from '../viewAsRedux';
import {lessonIsLockedForAllStudents} from '@cdo/apps/templates/progress/progressHelpers';
import {isStageHiddenForSection} from '../hiddenStageRedux';

/**
 * When viewing a puzzle, we want teachers to be able to toggle between what the
 * student would see and what they see as a teacher. In some cases (such as
 * locked stages and hidden stages) this means hiding the main content, and
 * replacing it with something else.
 * We accomplish this by having the server render that other content to a known
 * dom element (#locked-lesson, #hidden-lesson). This component then creates
 * container elements for the main content and any other content, and toggles
 * which of those containers is visible as appropriate.
 */
class TeacherContentToggle extends React.Component {
  static propTypes = {
    isBlocklyOrDroplet: PropTypes.bool.isRequired,
    // redux provided
    viewAs: PropTypes.string.isRequired,
    hiddenStagesInitialized: PropTypes.bool.isRequired,
    sectionsAreLoaded: PropTypes.bool.isRequired,
    isHiddenStage: PropTypes.bool.isRequired,
    isLockedStage: PropTypes.bool.isRequired
  };

  componentDidMount() {
    if ($('#level-body').length === 0) {
      throw new Error('Expected level-body');
    }
    // Show this element, as parent div (refs.lockMessage) now owns visibility
    $('#locked-lesson')
      .appendTo(this.refs.lockMessage)
      .show();
    $('#hidden-lesson')
      .appendTo(this.refs.hiddenMessage)
      .show();
    // Server initially sets level-body visibility to hidden when viewAs=Student
    // so that student view doesnt show content while we make async calls. Once
    // this component has mounted, we move level-body into our first div, which
    // will now own toggling visibility
    $('#level-body')
      .css('visibility', '')
      .appendTo(this.refs.content);
  }

  render() {
    const {
      viewAs,
      hiddenStagesInitialized,
      sectionsAreLoaded,
      isLockedStage,
      isHiddenStage,
      isBlocklyOrDroplet
    } = this.props;

    const frameStyle = {
      position: 'relative',
      zIndex: 1,
      backgroundColor: getComputedStyle(document.body).backgroundColor,
      height: window.screen.height
    };

    let contentStyle = {
      height: '100%'
    };
    let hasOverlayFrame = isLockedStage || isHiddenStage;

    if (viewAs === ViewType.Student) {
      // Keep this hidden until we've made our async calls for hidden_stages and
      // locked stages, so that we don't flash content before hiding it
      if (!hiddenStagesInitialized || !sectionsAreLoaded || hasOverlayFrame) {
        contentStyle.visibility = 'hidden';
      }
    }

    // In the case where isBlocklyOrDroplet is true, we don't want to actually set
    // display none, as that causes the editor (be it blockly or droplet) to
    // misrender. We can get away with just setting visibilityhidden because the editor
    // is rendered to an absolute position and doesnt affect the layout of this
    // component. For cases where we don't have an IDE (i.e. multi/match) we
    // need to set display:none such that it doesnt affect our layout
    if (hasOverlayFrame && !isBlocklyOrDroplet) {
      contentStyle.display = 'none';
    }

    const showLockedStageMessage = isLockedStage && !isHiddenStage;
    const showHiddenStageMessage = isHiddenStage;

    // Note: This component depends on the fact that the only thing we change about
    // our children as we rerender is their style.
    return (
      <div style={styles.container}>
        <div style={contentStyle} ref="content" />
        <div
          style={[frameStyle, !showLockedStageMessage && styles.hidden]}
          ref="lockMessage"
        />
        <div
          style={[frameStyle, !showHiddenStageMessage && styles.hidden]}
          ref="hiddenMessage"
        />
      </div>
    );
  }
}

const styles = {
  container: {
    height: '100%'
  },
  hidden: {
    display: 'none'
  }
};

export const UnconnectedTeacherContentToggle = Radium(TeacherContentToggle);

// Exported so that it can be tested
export const mapStateToProps = state => {
  const viewAs = state.viewAs;

  let isLockedStage = false;
  let isHiddenStage = false;
  const {currentLessonId} = state.progress;
  if (viewAs === ViewType.Student) {
    const {selectedSectionId} = state.teacherSections;

    isLockedStage = lessonIsLockedForAllStudents(currentLessonId, state);
    isHiddenStage = isStageHiddenForSection(
      state.hiddenStage,
      selectedSectionId,
      currentLessonId
    );
  } else if (!state.verifiedTeacher.isVerified) {
    // if not-authorized teacher
    isLockedStage = state.progress.stages.some(
      stage => stage.id === currentLessonId && stage.lockable
    );
  }

  return {
    viewAs,
    sectionsAreLoaded: state.teacherSections.sectionsAreLoaded,
    hiddenStagesInitialized: state.hiddenStage.hiddenStagesInitialized,
    isHiddenStage,
    isLockedStage
  };
};

export default connect(mapStateToProps)(UnconnectedTeacherContentToggle);
