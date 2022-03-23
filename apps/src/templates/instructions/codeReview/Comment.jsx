import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import javalabMsg from '@cdo/javalab/locale';
import color from '@cdo/apps/util/color';
import msg from '@cdo/locale';
import {commentShape} from './commentShape';
import InlineDropdownMenu from '@cdo/apps/templates/InlineDropdownMenu';
import Tooltip from '@cdo/apps/templates/Tooltip';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';

class Comment extends Component {
  static propTypes = {
    comment: commentShape.isRequired,
    onResolveStateToggle: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    viewAsCodeReviewer: PropTypes.bool.isRequired,
    // Populated by Redux
    viewAsTeacher: PropTypes.bool
  };

  state = {
    hideResolved: true
  };

  componentDidUpdate(prevProps) {
    // We always hide the comment when it changes to resolved.
    // We never hide a comment that is unresolved.
    // A user can choose to show/hide a comment that is resolved.
    if (!prevProps.comment.isResolved && this.props.comment.isResolved) {
      this.setState({hideResolved: true});
    }
  }

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

  toggleHideResolved = () => {
    this.setState(state => {
      return {hideResolved: !state.hideResolved};
    });
  };

  getMenuItems = () => {
    const {
      viewAsCodeReviewer,
      viewAsTeacher,
      onDelete,
      onResolveStateToggle
    } = this.props;
    const {isResolved} = this.props.comment;
    const {hideResolved} = this.state;
    let menuItems = [];
    if (isResolved) {
      // resolved comments can be collapsed/expanded
      menuItems.push({
        onClick: this.toggleHideResolved,
        text: hideResolved ? msg.show() : msg.hide(),
        iconClass: hideResolved ? 'eye' : 'eye-slash'
      });
    }
    if (!viewAsCodeReviewer) {
      // Code owners can resolve/unresolve comment
      // TODO: Allow teachers to resolve/unresolve comments too
      menuItems.push({
        onClick: onResolveStateToggle,
        text: isResolved
          ? javalabMsg.markIncomplete()
          : javalabMsg.markComplete(),
        iconClass: isResolved ? 'circle-o' : 'check-circle'
      });
    }
    if (viewAsTeacher) {
      // Instructors can delete comments
      menuItems.push({
        onClick: onDelete,
        text: javalabMsg.delete(),
        iconClass: 'trash'
      });
    }

    return menuItems.map((item, index) => {
      return (
        <a onClick={item.onClick} key={index} className="comment-menu-item">
          <span
            style={styles.icon}
            className={'fa fa-fw fa-' + item.iconClass}
          />
          <span style={styles.text}>{item.text}</span>
        </a>
      );
    });
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

    const {hideResolved} = this.state;

    return (
      <div
        style={{
          ...styles.commentContainer,
          ...((isFromOlderVersionOfProject || isResolved) && styles.lessVisible)
        }}
      >
        <div style={styles.commentHeaderContainer}>
          {isResolved && (
            <i
              className="fa fa-check-circle resolved-checkmark"
              style={styles.check}
            />
          )}
          {this.renderName()}
          <span
            style={styles.rightAlignedCommentHeaderSection}
            className="comment-right-header"
          >
            <span style={styles.timestamp}>
              {this.renderFormattedTimestamp(timestampString)}
            </span>
            <InlineDropdownMenu
              selector={
                <img
                  src={
                    '/blockly/media/templates/instructions/codeReview/ellipsis.svg'
                  }
                  style={{height: '3px', display: 'flex'}}
                />
              }
            >
              {this.getMenuItems()}
            </InlineDropdownMenu>
          </span>
        </div>
        {!(isResolved && hideResolved) && (
          <div
            className="code-review-comment-body"
            style={{
              ...styles.comment,
              ...(isFromTeacher && styles.commentFromTeacher),
              ...((isFromOlderVersionOfProject || isResolved) &&
                styles.lessVisibleBackgroundColor)
            }}
          >
            {commentText}
          </div>
        )}
        {hasError && this.renderErrorMessage()}
      </div>
    );
  }
}

export const UnconnectedComment = Comment;
export default connect(state => ({
  viewAsTeacher: state.viewAs === ViewType.Instructor
}))(Comment);

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
  check: {
    position: 'absolute',
    left: '-18px',
    lineHeight: '18px',
    fontSize: '15px'
  },
  comment: {
    clear: 'both',
    backgroundColor: color.lightest_gray,
    padding: '10px 12px',
    borderRadius: 8
  },
  commentContainer: {
    marginBottom: '25px'
  },
  commentFromTeacher: {
    backgroundColor: color.lightest_cyan
  },
  lessVisible: {color: color.light_gray},
  lessVisibleBackgroundColor: {backgroundColor: color.background_gray},
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
  },
  text: {padding: '0 5px'},
  icon: {fontSize: '18px'}
};
