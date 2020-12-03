import PropTypes from 'prop-types';
import React from 'react';
import {
  levelType,
  studentLevelProgressType
} from '@cdo/apps/templates/progress/progressTypes';
import ProgressTableLevelBubble from './ProgressTableLevelBubble';
import ProgressTableUnpluggedBubble from './ProgressTableUnpluggedBubble';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';
import color from '@cdo/apps/util/color';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import _ from 'lodash';

const styles = {
  container: {
    ...progressStyles.flexBetween,
    position: 'relative',
    whiteSpace: 'nowrap'
  },
  diamondContainer: {
    // Height needed only by IE to get diamonds to line up properly
    height: 36
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
export default class ProgressTableDetailCell extends React.Component {
  static whyDidYouRender = true;
  static propTypes = {
    studentId: PropTypes.number.isRequired,
    sectionId: PropTypes.number.isRequired,
    levels: PropTypes.arrayOf(levelType).isRequired,
    studentProgress: PropTypes.objectOf(studentLevelProgressType).isRequired,
    stageExtrasEnabled: PropTypes.bool
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
    if (!level.url) {
      return null;
    }
    const {studentId, sectionId} = this.props;
    return `${level.url}?section_id=${sectionId}&user_id=${studentId}`;
  }

  renderSublevels(level) {
    return (
      <div>
        {level.sublevels.map(sublevel => {
          const subProgress = this.props.studentProgress[sublevel.id];
          const subStatus = subProgress && subProgress.status;
          return (
            <div
              key={sublevel.id}
              style={styles.sublevelContainer}
              onClick={_ => this.recordBubbleClick(sublevel.id)}
            >
              <ProgressTableLevelBubble
                levelStatus={subStatus}
                disabled={!!level.bonus && !this.props.stageExtrasEnabled}
                smallBubble={true}
                bonus={sublevel.bonus}
                concept={sublevel.isConceptLevel}
                title={sublevel.bubbleTitle}
                url={this.buildBubbleUrl(sublevel)}
              />
            </div>
          );
        })}
      </div>
    );
  }

  renderBubble = level => {
    const {studentProgress, stageExtrasEnabled} = this.props;
    const levelProgress = studentProgress[level.id];
    const status = levelProgress && levelProgress.status;
    const paired = levelProgress && levelProgress.paired;
    const url = this.buildBubbleUrl(level);

    if (level.isUnplugged) {
      return (
        <div key={level.id} onClick={_ => this.recordBubbleClick(level.id)}>
          <ProgressTableUnpluggedBubble levelStatus={status} url={url} />
        </div>
      );
    }

    const conceptContainer =
      (level.isConceptLevel && styles.diamondContainer) || {};
    return (
      <div
        key={`${level.id}_${level.levelNumber}`}
        style={{
          ...styles.container,
          ...conceptContainer
        }}
      >
        <div onClick={_ => this.recordBubbleClick(level.id)}>
          <ProgressTableLevelBubble
            levelStatus={status}
            levelKind={level.kind}
            disabled={!!level.bonus && !stageExtrasEnabled}
            bonus={level.bonus}
            paired={paired}
            concept={level.isConceptLevel}
            title={level.bubbleTitle}
            url={url}
          />
        </div>
        {level.sublevels && this.renderSublevels(level)}
      </div>
    );
  };

  render() {
    return (
      <div style={{...styles.container, ...progressStyles.cellContent}}>
        <div style={styles.background} />
        {this.props.levels.map(level => this.renderBubble(level))}
      </div>
    );
  }
}
