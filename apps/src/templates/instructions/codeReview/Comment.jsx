import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';

// shape includes comment, commenter, project ID, project version, is from teacher?
export default class Comment extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    timestampString: PropTypes.string.isRequired,
    isResolved: PropTypes.bool.isRequired,
    isFromTeacher: PropTypes.bool.isRequired,
    isFromProjectOwner: PropTypes.bool.isRequired,
    isFromOlderVersionOfProject: PropTypes.bool.isRequired
  };

  state = {
    showEllipsisMenu: false
  };

  renderName = () => {
    const teacherCommentSuffix = ' (only visible to you)';
    return (
      <span>
        <span style={styles.name}>{this.props.name}</span>
        {this.props.isFromTeacher && (
          <span style={styles.teacherNameSuffix}>{teacherCommentSuffix}</span>
        )}
      </span>
    );
  };

  render() {
    const {
      timestampString,
      isResolved,
      isFromProjectOwner,
      isFromOlderVersionOfProject
    } = this.props;

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
          {!isResolved && <span className="fa fa-check" style={styles.check} />}
          <span style={styles.timestamp}>{timestampString}</span>
          {this.state.showEllipsisMenu && (
            <div>Placeholder for ellipsis menu</div>
          )}
        </div>
        <div
          style={{
            ...styles.comment,
            ...(isFromProjectOwner && styles.projectOwnerComment),
            ...(isFromOlderVersionOfProject &&
              styles.olderVersionCommentBackgroundColor)
          }}
        >
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book.
        </div>
      </div>
    );
  }
}

// TODO: dedupe ellipsis and check styles
const styles = {
  name: {
    fontWeight: 'bold'
  },
  teacherNameSuffix: {
    fontStyle: 'italic'
  },
  ellipsisMenu: {
    float: 'right',
    fontSize: '24px',
    lineHeight: '18px',
    margin: '0 0 0 5px',
    cursor: 'pointer'
  },
  check: {
    color: color.green,
    float: 'right',
    fontSize: '24px',
    lineHeight: '18px',
    margin: '0 0 0 5px'
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
