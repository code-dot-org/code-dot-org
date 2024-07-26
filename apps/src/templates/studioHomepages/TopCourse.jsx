import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import Button, {buttonColors} from '@cdo/apps/componentLibrary/button/Button';
import i18n from '@cdo/locale';

import styles from './top-course.module.scss';

// While this is named TopCourse, it really refers to the most recent course
// or script in which the student or teacher has progress.

class TopCourse extends Component {
  static propTypes = {
    isRtl: PropTypes.bool.isRequired,
    assignableName: PropTypes.string.isRequired,
    lessonName: PropTypes.string.isRequired,
    linkToOverview: PropTypes.string.isRequired,
    linkToLesson: PropTypes.string.isRequired,
  };

  render() {
    const {assignableName, lessonName, linkToOverview, linkToLesson, isRtl} =
      this.props;
    const localeStyle = isRtl ? styles.ltr : styles.rtl;

    return (
      <div className={styles.card}>
        <div className={styles.header} />
        <div className={styles.name}>{assignableName}</div>
        <div className={styles.description}>
          <div>{i18n.topCourseLessonIntro({lessonName})}</div>
          <div className={styles.details}>{i18n.topCourseExplanation()}</div>
        </div>
        <div className={`${styles.buttonBox} ${localeStyle}`}>
          <Button
            useAsLink={true}
            href={linkToOverview}
            ariaLabel={i18n.viewCourse()}
            color={buttonColors.gray}
            text={i18n.viewCourse()}
            type="secondary"
            size="s"
          />
          <span className={styles.lessonButton}>
            <Button
              useAsLink={true}
              href={linkToLesson}
              ariaLabel={i18n.viewCourse()}
              color={buttonColors.purple}
              text={i18n.continueLesson()}
              size="s"
            />
          </span>
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  isRtl: state.isRtl,
}))(TopCourse);
