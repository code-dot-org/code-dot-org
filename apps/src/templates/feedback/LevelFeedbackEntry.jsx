import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import shapes from './shapes';
import {UnlocalizedTimeAgo as TimeAgo} from '@cdo/apps/templates/TimeAgo';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import firehoseClient from '@cdo/apps/lib/util/firehose';

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
    boxSizing: 'border-box'
  },
  lessonDetails: {
    width: '75%',
    marginLeft: 15,
    marginTop: 15,
    marginBottom: 5
  },
  lessonLevel: {
    fontSize: 16,
    marginBottom: 8,
    color: color.teal
  },
  unit: {
    color: color.teal
  },
  label: {
    fontFamily: '"Gotham 5r", sans-serif',
    marginRight: 5,
    marginLeft: 10
  },
  time: {
    marginTop: 15,
    fontStyle: 'italic',
    color: color.light_gray,
    float: 'left'
  },
  comment: {
    fontStyle: 'italic',
    color: color.charcoal,
    marginLeft: 25,
    marginRight: 25,
    fontSize: 14
  },
  icon: {
    fontSize: 18
  },
  iconBox: {
    float: 'left',
    paddingLeft: 25,
    cursor: 'pointer'
  },
  commentBox: {
    float: 'left',
    width: '96%'
  }
};

const measureElement = element => {
  const DOMNode = ReactDOM.findDOMNode(element);
  return {
    height: DOMNode.offsetHeight
  };
};

const initialCommentHeight = 60;

export default class LevelFeedbackEntry extends Component {
  state = {
    expanded: false,
    commentHeight: initialCommentHeight
  };

  static propTypes = {feedback: shapes.feedback};

  expand = () => {
    this.setState({expanded: true});
    firehoseClient.putRecord({
      study: 'all-feedback',
      event: 'expand',
      data_string: this.props.feedback.id
    });
  };

  collapse = () => {
    this.setState({expanded: false});
  };

  componentDidMount() {
    this.comment &&
      this.setState({commentHeight: measureElement(this.comment).height});
  }

  longComment = () => {
    let long = this.state.commentHeight > initialCommentHeight;
    if (long) {
      firehoseClient.putRecord({
        study: 'all-feedback',
        event: 'long-comment',
        data_string: this.props.feedback.id
      });
    }
    return long;
  };

  render() {
    const {
      seen_on_feedback_page_at,
      student_first_visited_at,
      lessonName,
      levelNum,
      linkToLevel,
      unitName,
      linkToUnit,
      created_at,
      comment,
      performance
    } = this.props.feedback;

    const seenByStudent = seen_on_feedback_page_at || student_first_visited_at;

    // These heights ensure that up to two lines of the comment will be visible, and a 'sneak peak' of the third line for long comments.
    const baseHeight = performance && comment.length > 2 ? 132 : 112;

    const style = {
      backgroundColor: seenByStudent ? color.lightest_teal : color.white,
      height: this.state.expanded ? 'auto' : baseHeight,
      overflow: this.state.expanded ? 'none' : 'hidden',
      ...styles.main
    };

    const performanceStyle = {
      width: '100%',
      marginBottom: 5,
      ...styles.comment
    };

    const rubricPerformance = {
      performanceLevel1: i18n.rubricLevelOneHeader(),
      performanceLevel2: i18n.rubricLevelTwoHeader(),
      performanceLevel3: i18n.rubricLevelThreeHeader(),
      performanceLevel4: i18n.rubricLevelFourHeader()
    };

    const showRightCaret = this.longComment() && !this.state.expanded;
    const showDownCaret = this.longComment() && this.state.expanded;

    return (
      <div style={style}>
        <div style={styles.lessonDetails}>
          <a href={linkToLevel}>
            <div style={styles.lessonLevel}>
              <span style={styles.label}>
                {i18n.feedbackNotificationLesson()}
              </span>
              <span>{lessonName}</span>
              <span style={styles.label}>
                {i18n.feedbackNotificationLevel()}
              </span>
              <span>{levelNum}</span>
            </div>
          </a>
          <a href={linkToUnit}>
            <div style={styles.unit}>
              <span style={styles.label}>
                {i18n.feedbackNotificationUnit()}
              </span>
              <span>{unitName}</span>
            </div>
          </a>
        </div>
        <TimeAgo style={styles.time} dateString={created_at} />
        <div style={performanceStyle}>{rubricPerformance[performance]}</div>
        {showRightCaret ? (
          <span style={styles.iconBox}>
            <FontAwesome
              style={styles.icon}
              icon="caret-right"
              onClick={this.expand}
            />
          </span>
        ) : null}
        {showDownCaret ? (
          <span style={styles.iconBox}>
            <FontAwesome
              style={styles.icon}
              icon="caret-down"
              onClick={this.collapse}
            />
          </span>
        ) : null}
        <span style={styles.commentBox}>
          <div ref={r => (this.comment = r)} style={styles.comment}>
            {comment}
          </div>
        </span>
      </div>
    );
  }
}
