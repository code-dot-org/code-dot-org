import React, {Component} from 'react';
import PropTypes from 'prop-types';
import javalabMsg from '@cdo/javalab/locale';
import color from '@cdo/apps/util/color';
import msg from '@cdo/locale';
import {commentShape} from './commentShape';
import CommentOptions from './commentOptions';

export default class Comment extends Component {
  static propTypes = {
    comment: commentShape.isRequired,
    onDelete: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      isShowingCommentOptions: false,
      isResolved: this.props.comment.isResolved
    };
  }

  renderName = () => {
    const {name, isFromTeacher, isFromCurrentUser} = this.props.comment;

    if (isFromCurrentUser) {
      return <span style={styles.name}>{msg.you()}</span>;
    }

    const teacherCommentSuffix = ` (${javalabMsg.onlyVisibleToYou()})`;
    return (
      <span>
        <span style={styles.name}>{name}</span>
        {isFromTeacher && (
          <span style={styles.teacherNameSuffix}>{teacherCommentSuffix}</span>
        )}
      </span>
    );
  };

  render() {
    const {
      commentText,
      timestampString,
      isFromCurrentUser,
      isFromOlderVersionOfProject
    } = this.props.comment;

    const {isResolved, isShowingCommentOptions} = this.state;

    return (
      <div
        style={{
          ...styles.commentContainer,
          ...(isFromOlderVersionOfProject &&
            styles.olderVersionCommentTextColor)
        }}
      >
        <div style={styles.commentHeaderContainer}>
          {this.renderName()}
          <div
            className="fa fa-ellipsis-h"
            style={styles.ellipsisMenu}
            onClick={() =>
              this.setState({
                isShowingCommentOptions: !isShowingCommentOptions
              })
            }
          >
            {isShowingCommentOptions && (
              <CommentOptions
                isResolved={isResolved}
                onResolveClick={() =>
                  this.setState({
                    isResolved: !isResolved,
                    isShowingCommentOptions: false
                  })
                }
              />
            )}
          </div>
          {isResolved && <span className="fa fa-check" style={styles.check} />}
          <span style={styles.timestamp}>{timestampString}</span>
        </div>
        <div
          id={'code-review-comment-body'}
          style={{
            ...styles.comment,
            ...(isFromCurrentUser && styles.currentUserComment),
            ...(isFromOlderVersionOfProject &&
              styles.olderVersionCommentBackgroundColor)
          }}
        >
          {commentText}
        </div>
      </div>
    );
  }
}

const sharedIconStyles = {
  float: 'right',
  fontSize: '24px',
  lineHeight: '18px',
  margin: '0 0 0 5px'
};

const styles = {
  name: {
    fontFamily: '"Gotham 5r"'
  },
  teacherNameSuffix: {
    fontStyle: 'italic'
  },
  ellipsisMenu: {
    ...sharedIconStyles,
    cursor: 'pointer'
  },
  check: {
    ...sharedIconStyles,
    color: color.green
  },
  comment: {
    clear: 'both',
    backgroundColor: color.lighter_gray,
    padding: '10px 12px'
  },
  commentContainer: {
    marginBottom: '25px'
  },
  currentUserComment: {
    backgroundColor: color.lightest_cyan
  },
  olderVersionCommentTextColor: {color: color.light_gray},
  olderVersionCommentBackgroundColor: {backgroundColor: color.background_gray},
  timestamp: {
    fontStyle: 'italic',
    float: 'right',
    margin: '0 5px'
  },
  commentHeaderContainer: {
    marginBottom: '5px',
    position: 'relative'
  }
};
