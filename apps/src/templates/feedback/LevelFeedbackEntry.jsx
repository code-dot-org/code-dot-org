import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import shapes from './shapes';
import {UnlocalizedTimeAgo as TimeAgo} from '@cdo/apps/templates/TimeAgo';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import firehoseClient from '@cdo/apps/lib/util/firehose';

const measureElement = element => {
  const DOMNode = ReactDOM.findDOMNode(element);
  return {
    height: DOMNode.offsetHeight
  };
};

const initialCommentHeight = 40;

const RubricPerformanceCopy = {
  performanceLevel1: i18n.rubricLevelOneHeader(),
  performanceLevel2: i18n.rubricLevelTwoHeader(),
  performanceLevel3: i18n.rubricLevelThreeHeader(),
  performanceLevel4: i18n.rubricLevelFourHeader()
};

export default class LevelFeedbackEntry extends Component {
  state = {
    expanded: false,
    commentHeight: 0
  };

  static propTypes = {feedback: shapes.feedback};

  expand = () => {
    this.setState({expanded: true});
    firehoseClient.putRecord(
      {
        study: 'all-feedback',
        event: 'expand-feedback',
        data_json: {feedback_id: this.props.feedback.id}
      },
      {includeUserId: true}
    );
  };

  collapse = () => {
    this.setState({expanded: false});
  };

  componentDidMount() {
    this.comment &&
      this.setState({commentHeight: measureElement(this.comment).height});
  }

  render() {
    const {
      seen_on_feedback_page_at,
      student_first_visited_at,
      lessonName,
      lessonNum,
      levelNum,
      linkToLevel,
      unitName,
      created_at,
      comment,
      performance
    } = this.props.feedback;

    const {expanded, commentHeight} = this.state;

    const seenByStudent = seen_on_feedback_page_at || student_first_visited_at;

    const commentExists = comment.length > 2;

    // These heights ensure that the initial line of the comment will be visible, and a 'sneak peak' of the second line for long comments.
    let baseHeight = 72;
    if (commentExists && performance !== null) {
      baseHeight = 125;
    } else if (commentExists || performance !== null) {
      baseHeight = 96;
    }

    const style = {
      backgroundColor: seenByStudent ? color.background_gray : color.white,
      height: expanded ? 'auto' : baseHeight,
      overflow: expanded ? 'none' : 'hidden',
      ...styles.main
    };

    const isCommentExpandable = commentHeight >= initialCommentHeight;

    const showCommentFade = isCommentExpandable && !expanded;

    return (
      <div style={style}>
        <div style={styles.lessonDetails}>
          <a href={linkToLevel}>
            <div style={styles.lessonLevel}>
              {i18n.feedbackNotificationLesson({
                lessonNum,
                lessonName,
                levelNum
              })}
            </div>
          </a>
          <div style={styles.unit}>
            {i18n.feedbackNotificationUnit({unitName})}
          </div>
        </div>
        <TimeAgo style={styles.time} dateString={created_at} />
        {performance && (
          <div style={styles.rubricBox}>
            <span>{i18n.feedbackRubricEvaluation()}</span>&nbsp;
            <span style={styles.rubricPerformance}>
              {RubricPerformanceCopy[performance]}
            </span>
          </div>
        )}
        {isCommentExpandable && (
          <span
            style={styles.iconBox}
            onClick={expanded ? this.collapse() : this.expand()}
          >
            <FontAwesome
              style={styles.icon}
              icon={expanded ? 'caret-down' : 'caret-right'}
            />
          </span>
        )}
        {commentExists && (
          <span style={styles.commentBox}>
            <div ref={r => (this.comment = r)} style={styles.comment}>
              &quot;{comment}&quot;
            </div>
            {showCommentFade && <div style={styles.fadeout} />}
          </span>
        )}
      </div>
    );
  }
}

const styles = {
  main: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border_gray,
    minHeight: 72,
    width: '100%',
    marginBottom: 20,
    display: 'flex',
    flexFlow: 'wrap',
    boxSizing: 'border-box',
    padding: '8px 20px'
  },
  lessonDetails: {
    width: '75%',
    marginBottom: '4px'
  },
  lessonLevel: {
    fontSize: 18,
    lineHeight: '24px',
    marginBottom: 4,
    color: color.teal,
    fontFamily: '"Gotham 5r", sans-serif'
  },
  unit: {
    color: color.dark_charcoal,
    fontSize: 14,
    lineHeight: '17px',
    marginBottom: 8
  },
  time: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: '17px',
    color: color.light_gray,
    float: 'right',
    textAlign: 'right',
    marginRight: 20,
    width: 200
  },
  comment: {
    color: color.dark_charcoal,
    marginBottom: 8,
    fontSize: 14,
    lineHeight: '21px',
    fontFamily: '"Gotham 5r", sans-serif'
  },
  rubricBox: {
    color: color.dark_charcoal,
    marginBottom: 8,
    fontSize: 14,
    lineHeight: '21px',
    width: '100%'
  },
  rubricPerformance: {
    fontFamily: '"Gotham 5r", sans-serif'
  },
  icon: {
    fontSize: 18
  },
  iconBox: {
    float: 'left',
    paddingRight: 20,
    paddingLeft: 5,
    cursor: 'pointer'
  },
  commentBox: {
    float: 'left',
    width: '96%',
    position: 'relative'
  },
  fadeout: {
    bottom: 0,
    height: 'calc(100% - 15px)',
    background:
      'linear-gradient(rgba(255, 255, 255, 0) 0%,rgba(255, 255, 255, 1) 100%)',
    position: 'absolute',
    width: '100%'
  }
};
