import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  levelType,
  studentLevelProgressType
} from '@cdo/apps/templates/progress/progressTypes';
import ProgressTableLevelBubble from './ProgressTableLevelBubble';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';
import color from '@cdo/apps/util/color';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import _ from 'lodash';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

const UNPLUGGED_BUBBLE_WIDTH = getUnpluggedWidth();

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
export default class ProgressTableDetailCell extends React.Component {
  static widthForLevels(levels) {
    return (
      levels.reduce((sum, level) => {
        return (
          sum +
          (level.isUnplugged
            ? UNPLUGGED_BUBBLE_WIDTH
            : progressStyles.BUBBLE_CONTAINER_WIDTH) +
          (level.sublevels || []).length *
            progressStyles.LETTER_BUBBLE_CONTAINER_WIDTH
        );
      }, 0) +
      2 * progressStyles.CELL_PADDING
    );
  }

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

    return (
      <div key={`${level.id}_${level.levelNumber}`} style={styles.container}>
        <div onClick={_ => this.recordBubbleClick(level.id)}>
          <ProgressTableLevelBubble
            levelStatus={status}
            levelKind={level.kind}
            disabled={!!level.bonus && !stageExtrasEnabled}
            unplugged={level.isUnplugged}
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

/**
 * The width of the unplugged bubble depends on the localization of the text,
 * but our table needs to know its rendered width for determining column width,
 * so we calculate the width here by adding the element to the dom, getting its
 * width, then removing it.
 *
 * Note: it would make more sense to put this code in the same file with the
 * ProgressTableLevelBubble component, but due to JSX compilation the class
 * symbol for the component is undefined in that file.
 */
function getUnpluggedWidth() {
  // Create invisible container
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  document.body.appendChild(outer);

  // Create React element
  const unpluggedElement = React.createElement(
    ProgressTableLevelBubble,
    {
      levelStatus: LevelStatus.not_tried,
      unplugged: true,
      disabled: false,
      url: ''
    },
    null
  );

  // Render node and fetch from DOM
  const unpluggedNode = ReactDOM.findDOMNode(
    ReactDOM.render(unpluggedElement, outer)
  );

  // Store the width
  const width = unpluggedNode.offsetWidth;

  // Remove temporary elements from DOM
  ReactDOM.unmountComponentAtNode(outer);
  outer.parentNode.removeChild(outer);

  return width;
}
