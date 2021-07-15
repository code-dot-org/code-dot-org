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
    onDelete: PropTypes.func.isRequired,
    onResolve: PropTypes.func.isRequired,
    token: PropTypes.string.isRequired
  };

  state = {
    isShowingCommentOptions: false
  };

  onDelete = commentId => {
    this.setState({isShowingCommentOptions: false});

    $.ajax({
      url: `/code_review_comments/${commentId}`,
      type: 'DELETE',
      headers: {'X-CSRF-Token': this.props.token}
    }).done(result => {
      this.props.onDelete(commentId);
    });
  };

  onResolve = commentId => {
    this.setState({isShowingCommentOptions: false});

    $.ajax({
      url: `/code_review_comments/${commentId}/resolve`,
      type: 'PATCH',
      headers: {'X-CSRF-Token': this.props.token},
      data: {is_resolved: !this.state.isResolved}
    }).done(result => {
      this.setState({isResolved: !this.state.isResolved});
    });
  };

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
      id,
      commentText,
      timestampString,
      isFromCurrentUser,
      isFromOlderVersionOfProject,
      isResolved
    } = this.props.comment;

    const {isShowingCommentOptions} = this.state;

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
                onResolveClick={() => {
                  this.onResolve(id);
                  this.props.onResolve(id);
                  this.setState({isShowingCommentOptions: false});
                }}
                onDeleteClick={() => this.onDelete(id)}
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
