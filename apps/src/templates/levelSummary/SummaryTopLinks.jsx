import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import {connect} from 'react-redux';

import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import i18n from '@cdo/locale';

import styles from './summary.module.scss';

const SummaryTopLinks = ({
  scriptData,
  // redux
  isRtl,
  selectedSection,
  currentLevelId,
  levels,
}) => {
  const currentLevel = levels.find(l => l.activeId === currentLevelId);
  const nextLevel = levels.find(l => l.position === currentLevel.position + 1);
  const sectionParam = selectedSection?.id
    ? `?section_id=${selectedSection.id}`
    : '';

  const logEvent = useCallback(
    eventName => {
      const {level} = scriptData;
      analyticsReporter.sendEvent(eventName, {
        levelId: level.id,
        levelName: level.name,
        levelType: level.type,
        ...scriptData.reportingData,
      });
    },
    [scriptData]
  );

  const onBackToLevelClick = e => {
    e.preventDefault();
    logEvent(EVENTS.SUMMARY_PAGE_BACK_TO_LEVEL_CLICKED);
    window.location.href = currentLevel.url + sectionParam;
  };

  const onNextLevelClick = e => {
    e.preventDefault();
    logEvent(EVENTS.SUMMARY_PAGE_NEXT_LEVEL_CLICKED);
    window.location.href = nextLevel.url + sectionParam;
  };

  return (
    <div className={styles.summaryContainer}>
      {/* Top Nav Links */}
      <p className={styles.navLinks}>
        <a
          href={`${currentLevel.url}${sectionParam}`}
          onClick={onBackToLevelClick}
        >
          &lt; {i18n.backToLevel()}
        </a>
        {nextLevel && (
          <a
            className={isRtl ? styles.navLinkLeft : styles.navLinkRight}
            href={`${nextLevel.url}${sectionParam}`}
            onClick={onNextLevelClick}
          >
            {i18n.nextLevelLink()} &gt;
          </a>
        )}
      </p>
    </div>
  );
};

SummaryTopLinks.propTypes = {
  scriptData: PropTypes.object,
  isRtl: PropTypes.bool,
  selectedSection: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }),
  currentLevelId: PropTypes.string,
  levels: PropTypes.arrayOf(
    PropTypes.shape({
      activeId: PropTypes.string.isRequired,
      position: PropTypes.number.isRequired,
    })
  ),
};

export default connect(
  // NOTE: Some of this state data is loaded in by the teacher panel. If you
  // remove the teacher panel, or try to use this component on a page without
  // the teacher panel, it will require extra steps to load in the data.
  state => {
    const currentLesson = state.progress.lessons.find(
      l => l.id === state.progress.currentLessonId
    );

    return {
      isRtl: state.isRtl,
      selectedSection:
        state.teacherSections.sections[state.teacherSections.selectedSectionId],
      currentLevelId: state.progress.currentLevelId,
      levels: currentLesson.levels,
    };
  }
)(SummaryTopLinks);
