import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import javalabMsg from '@cdo/javalab/locale';
import color from '@cdo/apps/util/color';
import msg from '@cdo/locale';
import {commentShape} from './commentShape';
import CommentOptions from './CommentOptions';
import Tooltip from '@cdo/apps/templates/Tooltip';

export default class Comment extends Component {
  static propTypes = {
    comment: commentShape.isRequired,
    onResolveStateToggle: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    viewAsCodeReviewer: PropTypes.bool.isRequired
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
    const {
      name,
      isFromTeacher,
      isFromCurrentUser,
      isFromProjectOwner
    } = this.props.comment;

    if (isFromCurrentUser) {
      return <span style={styles.name}>{msg.you()}</span>;
    }

    const teacherCommentSuffix = ` (${javalabMsg.teacherLabel()})`;
    const authorCommentSuffix = ` (${javalabMsg.authorLabel()})`;
    return (
      <span>
        <span
          style={{...(isFromTeacher && styles.teacherName), ...styles.name}}
        >
          {name}
          <span style={styles.nameSuffix}>
            {isFromTeacher && (
              <Tooltip text={javalabMsg.onlyVisibleToYou()} place="top">
                {teacherCommentSuffix}
              </Tooltip>
            )}
            {isFromProjectOwner && authorCommentSuffix}
          </span>
        </span>
      </span>
    );
  };

  renderFormattedTimestamp = timestampString =>
    moment(timestampString).format('M/D/YYYY [at] h:mm A');

  renderErrorMessage = () => {
    return <div style={styles.error}>{javalabMsg.commentUpdateError()}</div>;
  };

  render() {
    const {
      commentText,
      timestampString,
      isFromTeacher,
      isFromOlderVersionOfProject,
      isResolved,
      hasError
    } = this.props.comment;
    const {viewAsCodeReviewer} = this.props;

    const {isShowingCommentOptions} = this.state;

    const nameAndTimeTextStyle = {...(isResolved && {color: color.light_gray})};

    return (
      <div
        style={{
          ...styles.commentContainer,
          ...(isFromOlderVersionOfProject &&
            styles.olderVersionCommentTextColor)
        }}
      >
        {isResolved && (
          <i className="fa fa-check-circle" style={styles.check} />
        )}
        {!isResolved && <div style={styles.noCheck}>&nbsp;</div>}
        <div style={{width: 'calc(100% - 25px)', float: 'right'}}>
          <div style={styles.commentHeaderContainer}>
            <span style={nameAndTimeTextStyle}>{this.renderName()}</span>
            <span style={styles.rightAlignedCommentHeaderSection}>
              <span style={{...styles.timestamp, ...nameAndTimeTextStyle}}>
                {this.renderFormattedTimestamp(timestampString)}
              </span>
              {/*isResolved && <i className="fa fa-check" style={styles.check} />*/}
              {!viewAsCodeReviewer && (
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
                      onResolveStateToggle={() => this.onResolve()}
                      onDelete={() => this.onDelete()}
                    />
                  )}
                </i>
              )}
            </span>
          </div>
          {!isResolved && (
            <div
              id={'code-review-comment-body'}
              style={{
                ...styles.comment,
                ...(isFromTeacher && styles.commentFromTeacher),
                ...(isFromOlderVersionOfProject &&
                  styles.olderVersionCommentBackgroundColor)
              }}
            >
              {commentText}
            </div>
          )}
          {hasError && this.renderErrorMessage()}
        </div>
      </div>
    );
  }
}

const sharedIconStyles = {
  fontSize: 18,
  lineHeight: '18px',
  margin: '0 0 0 5px'
};

const styles = {
  name: {
    fontFamily: '"Gotham 5r"'
  },
  teacherName: {
    color: color.default_blue
  },
  nameSuffix: {
    fontStyle: 'italic'
  },
  ellipsisMenu: {
    ...sharedIconStyles,
    cursor: 'pointer'
  },
  check: {
    ...sharedIconStyles,
    color: color.light_gray,
    width: 20,
    float: 'left',
    fontSize: 15
  },
  noCheck: {
    width: 20,
    float: 'left'
  },
  comment: {
    clear: 'both',
    backgroundColor: color.lightest_gray,
    padding: '10px 12px',
    borderRadius: 8
  },
  commentContainer: {
    marginBottom: 25
    //display: 'flex',
    //justifyContent: 'space-between'
  },
  commentFromTeacher: {
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
