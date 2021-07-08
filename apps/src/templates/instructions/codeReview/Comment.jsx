import React, {Component} from 'react';
import color from '@cdo/apps/util/color';
import {commentShape} from './commentShape';

export default class Comment extends Component {
  static propTypes = {
    comment: commentShape.isRequired
  };

  state = {
    showEllipsisMenu: false
  };

  renderName = () => {
    const {name, isFromTeacher} = this.props.comment;

    const teacherCommentSuffix = ' (only visible to you)';
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
      isResolved,
      isFromProjectOwner,
      isFromOlderVersionOfProject
    } = this.props.comment;

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
          <span
            className="fa fa-ellipsis-h"
            style={styles.ellipsisMenu}
            onClick={() =>
              this.setState({showEllipsisMenu: !this.state.showEllipsisMenu})
            }
          />
          {isResolved && <span className="fa fa-check" style={styles.check} />}
          <span style={styles.timestamp}>{timestampString}</span>
          {this.state.showEllipsisMenu && (
            <div>Placeholder for ellipsis menu</div>
          )}
        </div>
        <div
          id={'code-review-comment-body'}
          style={{
            ...styles.comment,
            ...(isFromProjectOwner && styles.projectOwnerComment),
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
    margin: '0 0 25px 0'
  },
  projectOwnerComment: {
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
    margin: '0 0 5px 0'
  }
};
