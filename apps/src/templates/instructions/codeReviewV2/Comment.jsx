import moment from 'moment';
import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';

import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import fontConstants from '@cdo/apps/fontConstants';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import InlineDropdownMenu from '@cdo/apps/templates/InlineDropdownMenu';
import {reviewCommentShape} from '@cdo/apps/templates/instructions/codeReviewV2/shapes';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import color from '@cdo/apps/util/color';
import javalabMsg from '@cdo/javalab/locale';
import msg from '@cdo/locale';
import '@cdo/apps/templates/instructions/codeReviewV2/comment.scss';

const FLASH_ERROR_TIME_MS = 5000;

function Comment({
  comment,
  onResolveStateToggle,
  onDelete,
  viewAsTeacher,
  currentUserId,
  viewingAsOwner,
}) {
  const isMounted = React.useRef(false);
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
    const {commenterName, commenterId, isFromTeacher} = comment;

    if (commenterId === currentUserId) {
      return <span style={styles.name}>{msg.you()}</span>;
    }

    if (isFromTeacher) {
      return (
        <span
          style={{
            ...styles.teacherName,
            ...styles.name,
          }}
        >
          {commenterName}
          <span style={styles.nameSuffix}>
            {` (${javalabMsg.teacherLabel()})`}
          </span>
        </span>
      );
    }

    return <span style={styles.name}>{commenterName}</span>;
  };

  const renderFormattedTimestamp = timestampString => {
    moment(timestampString).format('M/D/YYYY [at] h:mm A');
  };

  const toggleHideResolved = () => {
    setHideResolved(!hideResolved);
  };

  const handleToggleResolved = () => {
    const newIsResolvedStatus = !isCommentResolved;
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
        iconClass: hideResolved ? 'eye' : 'eye-slash',
      });
    }
    if (viewingAsOwner) {
      // Code owners can resolve/unresolve comment
      // TODO: Allow teachers to resolve/unresolve comments too
      menuItems.push({
        onClick: handleToggleResolved,
        text: isCommentResolved
          ? javalabMsg.markIncomplete()
          : javalabMsg.markComplete(),
        iconClass: isCommentResolved ? 'circle-o' : 'check-circle',
      });
    }
    if (viewAsTeacher) {
      // Instructors can delete comments
      menuItems.push({
        onClick: deleteCodeReviewComment,
        text: javalabMsg.delete(),
        iconClass: 'trash',
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

  const {comment: commentText, createdAt, isFromTeacher} = comment;

  if (isDeleted) {
    return null;
  }

  return (
    <div
      style={{
        ...styles.commentContainer,
        ...(isCommentResolved && styles.lessVisible),
      }}
    >
      <div style={styles.commentHeaderContainer}>
        {isCommentResolved && (
          <FontAwesome
            className="resolved-checkmark"
            icon="check-circle"
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
            {renderFormattedTimestamp(createdAt)}
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
                  alt=""
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
            ...(isCommentResolved && styles.lessVisibleBackgroundColor),
          }}
        >
          <SafeMarkdown markdown={commentText} className="comment-content" />
        </div>
      )}
      {displayError && (
        <div style={styles.error}>{javalabMsg.commentUpdateError()}</div>
      )}
    </div>
  );
}

Comment.propTypes = {
  comment: reviewCommentShape.isRequired,
  onResolveStateToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  viewingAsOwner: PropTypes.bool.isRequired,
  // Populated by Redux
  viewAsTeacher: PropTypes.bool,
  currentUserId: PropTypes.number,
};

export const UnconnectedComment = Comment;
export default connect(
  state => ({
    viewAsTeacher: state.viewAs === ViewType.Instructor,
    currentUserId: state.currentUser?.userId,
  }),
  {ViewType}
)(Comment);

const styles = {
  name: {
    ...fontConstants['main-font-semi-bold'],
  },
  iconName: {
    marginLeft: '20px',
  },
  teacherName: {
    color: color.default_blue,
  },
  nameSuffix: {
    fontStyle: 'italic',
  },
  check: {
    position: 'absolute',
    lineHeight: '18px',
    fontSize: '15px',
  },
  comment: {
    clear: 'both',
    backgroundColor: color.lightest_gray,
    padding: '10px 12px',
    borderRadius: 8,
  },
  commentContainer: {
    marginBottom: '25px',
  },
  commentFromTeacher: {
    backgroundColor: color.lightest_cyan,
  },
  lessVisible: {color: color.light_gray},
  lessVisibleBackgroundColor: {backgroundColor: color.background_gray},
  timestamp: {
    fontStyle: 'italic',
    margin: '0 5px',
  },
  commentHeaderContainer: {
    marginBottom: '5px',
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
  },
  rightAlignedCommentHeaderSection: {display: 'flex'},
  error: {
    backgroundColor: color.red,
    color: color.white,
    margin: '5px 0',
    padding: '10px 12px',
  },
  text: {padding: '0 5px'},
  icon: {fontSize: '18px'},
};
