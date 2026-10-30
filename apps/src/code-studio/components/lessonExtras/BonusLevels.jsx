import PropTypes from 'prop-types';
import React from 'react';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import i18n from '@cdo/locale';

import SublevelCard from '../SublevelCard';

import {lessonOfBonusLevels} from './shapes';

import styles from './bonus-levels.module.scss';

const CARD_AREA_SIZE = 900;

class BonusLevels extends React.Component {
  static propTypes = {
    bonusLevels: PropTypes.arrayOf(PropTypes.shape(lessonOfBonusLevels)),
    sectionId: PropTypes.number,
    userId: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.state = {
      lessonIndex: props.bonusLevels.length - 1,
    };
  }

  nextLesson = () => {
    if (!this.isNextArrowDisabled()) {
      this.setState({lessonIndex: this.state.lessonIndex + 1});
    }
  };

  previousLesson = () => {
    if (!this.isPreviousArrowDisabled()) {
      this.setState({lessonIndex: this.state.lessonIndex - 1});
    }
  };

  isPreviousArrowDisabled = () => {
    return this.state.lessonIndex === 0;
  };

  isNextArrowDisabled = () => {
    return this.state.lessonIndex === this.props.bonusLevels.length - 1;
  };

  render() {
    const currLessonNum =
      this.props.bonusLevels[this.state.lessonIndex].lessonNumber;

    const previousNumLessons = this.props.bonusLevels.filter(
      lesson => lesson.lessonNumber < currLessonNum
    ).length;
    const directionFactor = document.dir === 'rtl' ? 1 : -1;
    const scrollAmount = directionFactor * previousNumLessons * CARD_AREA_SIZE;

    const previousDisabled = this.isPreviousArrowDisabled();
    const nextDisabled = this.isNextArrowDisabled();

    return (
      <div>
        <h2 className={styles.lessonNumberHeading}>
          {i18n.extrasStageNChallenges({
            lessonNumber: currLessonNum,
          })}
        </h2>
        <div className={styles.scroller}>
          <FontAwesome
            icon={document.dir === 'rtl' ? 'caret-right' : 'caret-left'}
            onClick={this.previousLesson}
            className={`${styles.arrow} ${
              previousDisabled ? styles.arrowDisabled : ''
            }`}
          />
          <div className={styles.challenges} style={{width: CARD_AREA_SIZE}}>
            {this.props.bonusLevels.map(lesson => (
              <div
                key={lesson.lessonNumber}
                className={styles.challengeRow}
                style={{left: scrollAmount, width: CARD_AREA_SIZE}}
              >
                <div className={styles.cards}>
                  {lesson.levels.map(level => (
                    <SublevelCard
                      isLessonExtra={true}
                      sublevel={level}
                      key={level.id}
                      sectionId={this.props.sectionId}
                      userId={this.props.userId}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <FontAwesome
            icon={document.dir === 'rtl' ? 'caret-left' : 'caret-right'}
            onClick={this.nextLesson}
            className={`${styles.arrow} ${
              nextDisabled ? styles.arrowDisabled : ''
            }`}
          />
        </div>
      </div>
    );
  }
}

export default BonusLevels;
