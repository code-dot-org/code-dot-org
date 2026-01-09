import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import {
  BubbleSize,
  getBubbleUrl,
} from '@cdo/apps/templates/progress/BubbleFactory';
import {lessonHasLevels} from '@cdo/apps/templates/progress/progressHelpers';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';
import {
  levelType,
  studentLevelProgressType,
} from '@cdo/apps/templates/progress/progressTypes';
import color from '@cdo/apps/util/color';

import ProgressTableLevelBubble from './ProgressTableLevelBubble';

export default class ProgressTableDetailCell extends React.Component {
  static propTypes = {
    studentId: PropTypes.number.isRequired,
    sectionId: PropTypes.number.isRequired,
    levels: PropTypes.arrayOf(levelType).isRequired,
    studentProgress: PropTypes.objectOf(studentLevelProgressType).isRequired,
  };

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps) {
    return !_.isEqual(this.props, nextProps);
  }

  buildBubbleUrl(level) {
    return getBubbleUrl(level.url, this.props.studentId, this.props.sectionId);
  }

  renderSublevels(level) {
    return (
      <div>
        {level.sublevels.map(sublevel => {
          const sublevelProgress = this.props.studentProgress[sublevel.id];
          return (
            <div key={sublevel.id} style={styles.sublevelContainer}>
              <ProgressTableLevelBubble
                levelStatus={sublevelProgress?.status}
                bubbleSize={BubbleSize.letter}
                isBonus={sublevel.bonus}
                isConcept={sublevel.isConceptLevel}
                title={sublevel.bubbleText}
                url={this.buildBubbleUrl(sublevel)}
                reviewState={sublevelProgress?.teacherFeedbackReviewState}
              />
            </div>
          );
        })}
      </div>
    );
  }

  renderBubble(level) {
    const levelProgress = this.props.studentProgress[level.id];
    const url = this.buildBubbleUrl(level);

    return (
      <div key={`${level.id}_${level.levelNumber}`} style={styles.container}>
        <div>
          <ProgressTableLevelBubble
            levelStatus={levelProgress?.status}
            isLocked={levelProgress?.locked}
            levelKind={level.kind}
            isUnplugged={level.isUnplugged}
            isBonus={level.bonus}
            isPaired={levelProgress?.paired}
            isConcept={level.isConceptLevel}
            title={level.bubbleText}
            url={url}
            reviewState={levelProgress?.teacherFeedbackReviewState}
          />
        </div>
        {level.sublevels && this.renderSublevels(level)}
      </div>
    );
  }

  render() {
    if (!lessonHasLevels({levels: this.props.levels})) {
      return null;
    }
    return (
      <div style={styles.container} className="uitest-detail-cell cell-content">
        <div style={styles.background} />
        {this.props.levels.map(level => this.renderBubble(level))}
      </div>
    );
  }
}

const styles = {
  container: {
    ...progressStyles.flexBetween,
    position: 'relative',
    whiteSpace: 'nowrap',
  },
  background: {
    height: 10,
    backgroundColor: color.lighter_gray,
    position: 'absolute',
    left: 10,
    right: 10,
  },
  sublevelContainer: {
    position: 'relative',
    display: 'inline-block',
  },
};
