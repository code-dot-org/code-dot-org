import React, {useState, useEffect, useRef} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import javalabMsg from '@cdo/javalab/locale';
import color from '@cdo/apps/util/color';
import msg from '@cdo/locale';
import {commentShape} from '@cdo/apps/templates/instructions/codeReview/commentShape';
import InlineDropdownMenu from '@cdo/apps/templates/InlineDropdownMenu';
import Tooltip from '@cdo/apps/templates/Tooltip';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

const FLASH_ERROR_TIME_MS = 5000;

function Comment({
  comment,
  onResolveStateToggle,
  onDelete,
  viewAsCodeReviewer,
  viewAsTeacher
}) {
  const isMounted = useRef(false);
  const [isCommentResolved, setIsCommentResolved] = useState(
    comment.isResolved
  );
  const [hideResolved, setHideResolved] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [displayError, setDisplayError] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    setHideResolved(comment.isResolved);
    setIsCommentResolved(comment.isResolved);
  }, [comment.isResolved]);

  const renderName = () => {
    const {
      name,
      isFromTeacher,
      isFromCurrentUser,
      isFromProjectOwner
    } = comment;

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

  const renderFormattedTimestamp = timestampString => {
    moment(timestampString).format('M/D/YYYY [at] h:mm A');
  };

  const renderErrorMessage = () => {
    return <div style={styles.error}>{javalabMsg.commentUpdateError()}</div>;
  };

  const toggleHideResolved = () => {
    setHideResolved(!hideResolved);
  };

  const handleToggleResolved = () => {
    const newIsResolvedStatus = !comment.isResolved;
    onResolveStateToggle(
      comment.id,
      newIsResolvedStatus,
      () => setIsCommentResolved(newIsResolvedStatus),
      flashErrorMessage
    );
  };

  const deleteCodeReviewComment = () => {
    onDelete(comment.id, () => setIsDeleted(true), flashErrorMessage);
  };

  const getMenuItems = () => {
    let menuItems = [];
    if (isCommentResolved) {
      // resolved comments can be collapsed/expanded
      menuItems.push({
        onClick: toggleHideResolved,
        text: hideResolved ? msg.show() : msg.hide(),
        iconClass: hideResolved ? 'eye' : 'eye-slash'
      });
    }
    if (!viewAsCodeReviewer) {
      // Code owners can resolve/unresolve comment
      // TODO: Allow teachers to resolve/unresolve comments too
      menuItems.push({
        onClick: handleToggleResolved,
        text: isCommentResolved
          ? javalabMsg.markIncomplete()
          : javalabMsg.markComplete(),
        iconClass: isCommentResolved ? 'circle-o' : 'check-circle'
      });
    }
    if (viewAsTeacher) {
      // Instructors can delete comments
      menuItems.push({
        onClick: deleteCodeReviewComment,
        text: javalabMsg.delete(),
        iconClass: 'trash'
      });
    }

    return menuItems.map((item, index) => {
      const onClickWrapper = () => {
        setIsUpdating(true);
        // Wrap onClick in a promise because some menu items onClick
        // do not make async requests and thus do not return a promise
        // (eg, hiding/showing comments)

        // Return promise for tests.
        return Promise.resolve(item.onClick()).then(() => {
          if (isMounted.current) {
            setIsUpdating(false);
          }
        });
      };

      return (
        <a onClick={onClickWrapper} key={index} className="comment-menu-item">
          <span
            style={styles.icon}
            className={'fa fa-fw fa-' + item.iconClass}
          />
          <span style={styles.text}>{item.text}</span>
        </a>
      );
    });
  };

  const flashErrorMessage = () => {
    setDisplayError(true);
    setTimeout(() => setDisplayError(false), FLASH_ERROR_TIME_MS);
  };

  const {
    commentText,
    timestampString,
    isFromTeacher,
    isFromOlderVersionOfProject
  } = comment;

  if (isDeleted) {
    return null;
  }

  return (
    <div
      style={{
        ...styles.commentContainer,
        ...((isFromOlderVersionOfProject || isCommentResolved) &&
          styles.lessVisible)
      }}
    >
      <div style={styles.commentHeaderContainer}>
        {isCommentResolved && (
          <i
            className="fa fa-check-circle resolved-checkmark"
            style={styles.check}
          />
        )}
        <div style={isCommentResolved ? styles.iconName : {}}>
          {renderName()}
        </div>
        <span
          style={styles.rightAlignedCommentHeaderSection}
          className="comment-right-header"
        >
          <span style={styles.timestamp}>
            {renderFormattedTimestamp(timestampString)}
          </span>
          {isUpdating ? (
            <Spinner size="small" />
          ) : (
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
              {getMenuItems()}
            </InlineDropdownMenu>
          )}
        </span>
      </div>
      {!(isCommentResolved && hideResolved) && (
        <div
          className="code-review-comment-body"
          style={{
            ...styles.comment,
            ...(isFromTeacher && styles.commentFromTeacher),
            ...((isFromOlderVersionOfProject || isCommentResolved) &&
              styles.lessVisibleBackgroundColor)
          }}
        >
          <SafeMarkdown markdown={commentText} />
        </div>
      )}
      {displayError && renderErrorMessage()}
    </div>
  );
}

Comment.propTypes = {
  comment: commentShape.isRequired,
  onResolveStateToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  viewAsCodeReviewer: PropTypes.bool.isRequired,
  // Populated by Redux
  viewAsTeacher: PropTypes.bool
};

export const UnconnectedComment = Comment;
export default connect(
  state => ({
    viewAsTeacher: state.viewAs === ViewType.Instructor
  }),
  {ViewType}
)(Comment);

const styles = {
  name: {
    fontFamily: '"Gotham 5r"'
  },
  iconName: {
    marginLeft: '20px'
  },
  teacherName: {
    color: color.default_blue
  },
  nameSuffix: {
    fontStyle: 'italic'
  },
  check: {
    position: 'absolute',
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
