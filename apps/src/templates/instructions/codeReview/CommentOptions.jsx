import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';

class CommentOptions extends Component {
  static propTypes = {
    isResolved: PropTypes.bool.isRequired,
    onResolveClick: PropTypes.func.isRequired
  };

  commentOptionTypes = {
    markComplete: {
      onClick: this.props.onResolveClick,
      key: 'markComplete',
      iconClass: 'fa fa-fw fa-check',
      text: 'Mark Complete'
    },
    markUncomplete: {
      onClick: this.props.onResolveClick,
      key: 'markUncomplete',
      iconClass: 'fa fa-fw fa-undo',
      text: 'Mark Uncomplete'
    },
    delete: {
      onClick: () => {},
      key: 'delete',
      iconClass: 'fa fa-fw fa-trash',
      text: 'Delete'
    }
  };

  renderCommentOption = commentOption => {
    return (
      <div
        onClick={commentOption.onClick}
        style={styles.commentOptionContainer}
        key={commentOption.key}
      >
        <span style={styles.icon} className={commentOption.iconClass} />
        <span style={styles.text}>{commentOption.text}</span>
      </div>
    );
  };

  render() {
    return (
      <div style={styles.commentOptionsContainer}>
        {this.props.isResolved &&
          this.renderCommentOption(this.commentOptionTypes.markUncomplete)}
        {!this.props.isResolved &&
          this.renderCommentOption(this.commentOptionTypes.markComplete)}
        {this.renderCommentOption(this.commentOptionTypes.delete)}
      </div>
    );
  }
}

export default Radium(CommentOptions);

const styles = {
  commentOptionsContainer: {
    position: 'absolute',
    marginTop: '5px',
    right: '0px',
    zIndex: 1,
    boxShadow: `3px 3px 3px ${color.lighter_gray}`,
    borderRadius: '4px',
    backgroundColor: color.white
  },
  commentOptionContainer: {
    height: '22px',
    fontSize: '14px',
    fontFamily: '"Gotham 5r"',
    color: color.dark_charcoal,
    padding: '5px 12px',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: color.lightest_gray
    },
    display: 'flex',
    alignItems: 'center'
  },
  text: {padding: '0 5px'},
  icon: {fontSize: '18px'}
};
