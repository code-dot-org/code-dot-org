import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import javalabMsg from '@cdo/javalab/locale';
import color from '@cdo/apps/util/color';
import msg from '@cdo/locale';
import {commentShape} from './commentShape';
import CommentOptions from './CommentOptions';

export default class Comment extends Component {
  static propTypes = {
    comment: commentShape.isRequired,
    onResolveStateToggle: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
  };

  state = {isShowingCommentOptions: false};

  onDelete = () => {
    this.setState({isShowingCommentOptions: false});
    this.props.onDelete();
  };

  onResolve = () => {
    this.setState({isShowingCommentOptions: false});
    this.props.onResolveStateToggle();
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

  renderFormattedTimestamp = timestampString =>
    moment.utc(timestampString).format('M/D/YYYY [at] h:mm A');

  renderErrorMessage = () => {
    return <div style={styles.error}>{javalabMsg.commentUpdateError()}</div>;
  };

  render() {
    const {
      commentText,
      timestampString,
      isFromCurrentUser,
      isFromOlderVersionOfProject,
      isResolved,
      hasError
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
          <span style={styles.rightAlignedCommentHeaderSection}>
            <span style={styles.timestamp}>
              {this.renderFormattedTimestamp(timestampString)}
            </span>
            {isResolved && <i className="fa fa-check" style={styles.check} />}
            <i
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
                  onResolveStateToggle={() => {
                    this.props.onResolveStateToggle(id);
                    this.setState({isShowingCommentOptions: false});
                  }}
                  onDelete={() => this.onDelete(id)}
                />
              )}
            </i>
          </span>
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
        {hasError && this.renderErrorMessage()}
      </div>
    );
  }
}

const sharedIconStyles = {
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
    margin: '0 5px'
  },
  commentHeaderContainer: {
    marginBottom: '5px',
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between'
  },
  rightAlignedCommentHeaderSection: {display: 'flex'},
  error: {
    backgroundColor: color.red,
    color: color.white,
    margin: '5px 0',
    padding: '10px 12px'
  }
};
