import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import shapes from './shapes';
import {UnlocalizedTimeAgo as TimeAgo} from '@cdo/apps/templates/TimeAgo';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import firehoseClient from '@cdo/apps/lib/util/firehose';

const getElementHeight = element => {
  return ReactDOM.findDOMNode(element).offsetHeight;
};

const visibleCommentHeight = 40;

const RubricPerformanceLabel = {
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

  expandComment = () => {
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

  collapseComment = () => {
    this.setState({expanded: false});
  };

  componentDidMount() {
    this.comment &&
      this.setState({commentHeight: getElementHeight(this.comment)});
  }

  feedbackSeenByStudent() {
    const {
      seen_on_feedback_page_at,
      student_first_visited_at
    } = this.props.feedback;
    return seen_on_feedback_page_at || student_first_visited_at;
  }

  renderPerformance() {
    return (
      <div style={styles.feedbackText}>
        <span>{i18n.feedbackRubricEvaluation()}</span>&nbsp;
        <span style={styles.rubricPerformance}>
          {RubricPerformanceLabel[this.props.feedback.performance]}
        </span>
      </div>
    );
  }

  renderComment() {
    const {comment} = this.props.feedback;
    const {expanded, commentHeight} = this.state;

    const isCommentExpandable = commentHeight > visibleCommentHeight;
    const showCommentFade = isCommentExpandable && !expanded;

    const commentContainerStyle = expanded
      ? styles.commentContainer
      : styles.commentContainerCollapsed;

    return (
      <div style={commentContainerStyle}>
        {isCommentExpandable && (
          <FontAwesome
            style={styles.expanderIcon}
            icon={expanded ? 'caret-down' : 'caret-right'}
            onClick={expanded ? this.collapseComment : this.expandComment}
          />
        )}
        <span style={styles.commentText}>
          <div ref={r => (this.comment = r)} style={styles.feedbackText}>
            &quot;{comment}&quot;
          </div>
          {showCommentFade && (
            <div
              id="comment-fade"
              style={{
                ...styles.fadeout,
                ...(this.feedbackSeenByStudent() && styles.fadeoutSeen)
              }}
            />
          )}
        </span>
      </div>
    );
  }

  render() {
    const {
      lessonName,
      lessonNum,
      levelNum,
      linkToLevel,
      unitName,
      created_at,
      comment,
      performance
    } = this.props.feedback;

    const commentExists = comment.length > 2;

    const style = {
      backgroundColor: this.feedbackSeenByStudent()
        ? color.background_gray
        : color.white,
      ...styles.main
    };

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
        {performance && this.renderPerformance()}
        {commentExists && this.renderComment()}
      </div>
    );
  }
}

const styles = {
  main: {
    border: `1px solid ${color.border_gray}`,
    width: '100%',
    marginBottom: 20,
    boxSizing: 'border-box',
    padding: '8px 20px'
  },
  lessonDetails: {
    display: 'inline-block',
    marginBottom: 4
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
    fontSize: 14,
    lineHeight: '17px',
    color: color.light_gray,
    float: 'right'
  },
  feedbackText: {
    color: color.dark_charcoal,
    marginBottom: 8,
    fontSize: 14,
    lineHeight: '21px'
  },
  rubricPerformance: {
    fontFamily: '"Gotham 5r", sans-serif'
  },
  expanderIcon: {
    fontSize: 18,
    paddingRight: 20,
    paddingLeft: 5,
    cursor: 'pointer'
  },
  commentContainer: {
    display: 'flex'
  },
  commentContainerCollapsed: {
    display: 'flex',
    overflow: 'hidden',
    maxHeight: visibleCommentHeight
  },
  commentText: {
    position: 'relative', // for positioning fade over comment text
    fontFamily: '"Gotham 5r", sans-serif'
  },
  fadeout: {
    bottom: 0,
    height: 'calc(100% - 15px)',
    background:
      'linear-gradient(rgba(255, 255, 255, .4) 0%,rgba(255, 255, 255, 1) 100%)',
    position: 'absolute',
    width: '100%'
  },
  fadeoutSeen: {
    background:
      'linear-gradient(rgba(242, 242, 242, .4) 0%,rgba(242, 242, 242, 1) 100%)'
  }
};
