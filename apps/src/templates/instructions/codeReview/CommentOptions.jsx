import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';

const commentOptionTypes = {
  markComplete: {
    key: 'markComplete',
    iconClass: 'fa fa-fw fa-check',
    text: 'Mark Complete'
  },
  delete: {
    key: 'delete',
    iconClass: 'fa fa-fw fa-trash',
    text: 'Delete'
  }
};

class CommentOptions extends Component {
  // to do: actually pass these
  static propTypes = {
    onMarkComplete: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
  };

  renderCommentOption = commentOption => {
    return (
      <div style={styles.commentOptionContainer} key={commentOption.key}>
        <span style={styles.icon} className={commentOption.iconClass} />
        <span style={styles.text}>{commentOption.text}</span>
      </div>
    );
  };
  render() {
    return (
      <div style={styles.commentOptionsContainer}>
        {this.renderCommentOption(commentOptionTypes.markComplete)}
        {this.renderCommentOption(commentOptionTypes.delete)}
      </div>
    );
  }
}

export default Radium(CommentOptions);

const styles = {
  commentOptionsContainer: {
    position: 'absolute',
    margin: '5px 29px 0 0',
    right: '0px',
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
