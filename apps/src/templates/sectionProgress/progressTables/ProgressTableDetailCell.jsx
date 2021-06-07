import PropTypes from 'prop-types';
import React from 'react';
import {
  levelType,
  studentLevelProgressType
} from '@cdo/apps/templates/progress/progressTypes';
import {
  BubbleSize,
  getBubbleUrl
} from '@cdo/apps/templates/progress/BubbleFactory';
import ProgressTableLevelBubble from './ProgressTableLevelBubble';
import {lessonHasLevels} from '@cdo/apps/templates/progress/progressHelpers';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';
import color from '@cdo/apps/util/color';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import _ from 'lodash';

export default class ProgressTableDetailCell extends React.Component {
  static propTypes = {
    studentId: PropTypes.number.isRequired,
    sectionId: PropTypes.number.isRequired,
    levels: PropTypes.arrayOf(levelType).isRequired,
    studentProgress: PropTypes.objectOf(studentLevelProgressType).isRequired
  };

  constructor(props) {
    super(props);
    this.recordBubbleClick = this.recordBubbleClick.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return !_.isEqual(this.props, nextProps);
  }

  recordBubbleClick(levelId) {
    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: 'progress',
        event: 'go_to_level',
        data_json: JSON.stringify({
          student_id: this.props.studentId,
          section_id: this.props.sectionId,
          level_id: levelId
        })
      },
      {includeUserId: true}
    );
  }

  buildBubbleUrl(level) {
    return getBubbleUrl(level.url, this.props.studentId, this.props.sectionId);
  }

  renderSublevels(level) {
    return (
      <div>
        {level.sublevels.map(sublevel => {
          const subStatus = this.props.studentProgress[sublevel.id]?.status;
          return (
            <div
              key={sublevel.id}
              style={styles.sublevelContainer}
              onClick={_ => this.recordBubbleClick(sublevel.id)}
            >
              <ProgressTableLevelBubble
                levelStatus={subStatus}
                bubbleSize={BubbleSize.letter}
                isBonus={sublevel.bonus}
                isConcept={sublevel.isConceptLevel}
                title={sublevel.bubbleText}
                url={this.buildBubbleUrl(sublevel)}
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
        <div onClick={_ => this.recordBubbleClick(level.id)}>
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
    whiteSpace: 'nowrap'
  },
  background: {
    height: 10,
    backgroundColor: color.lighter_gray,
    position: 'absolute',
    left: 10,
    right: 10
  },
  sublevelContainer: {
    position: 'relative',
    display: 'inline-block'
  }
};
