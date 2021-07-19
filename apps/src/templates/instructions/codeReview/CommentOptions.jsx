import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import msg from '@cdo/locale';
import javalabMsg from '@cdo/javalab/locale';
import color from '@cdo/apps/util/color';

class CommentOptions extends Component {
  static propTypes = {
    isResolved: PropTypes.bool.isRequired,
    onResolveStateToggle: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
  };

  commentOptionTypes = {
    markResolved: {
      onClick: this.props.onResolveStateToggle,
      iconClass: 'fa fa-fw fa-check',
      text: javalabMsg.resolve(),
      key: 'Resolve'
    },
    unmarkResolved: {
      onClick: this.props.onResolveStateToggle,
      iconClass: 'fa fa-fw fa-undo',
      text: javalabMsg.reOpen(),
      key: 'Re-open'
    },
    delete: {
      onClick: this.props.onDelete,
      iconClass: 'fa fa-fw fa-trash',
      text: msg.delete(),
      key: 'Delete'
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
          this.renderCommentOption(this.commentOptionTypes.unmarkResolved)}
        {!this.props.isResolved &&
          this.renderCommentOption(this.commentOptionTypes.markResolved)}
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
