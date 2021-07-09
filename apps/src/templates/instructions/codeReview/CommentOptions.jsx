import React, {Component} from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';

const commentOptionTypes = {
  markComplete: {
    iconClass: 'fa fa-check',
    text: 'Mark Complete'
  },
  delete: {
    iconClass: 'fa fa-trash',
    text: 'Delete'
  }
};

export default class CommentOptions extends Component {
  // to do: actually pass these
  static propTypes = {
    onMarkComplete: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
  };
  renderCommentOption = commentOption => {
    return (
      <div style={styles.commentOptionContainer}>
        <div style={styles.commentOptionItemsContainer}>
          <span className={commentOption.iconClass} />
          <span>{commentOption.text}</span>
        </div>
      </div>
    );
  };
  render() {
    return (
      <div>
        {this.renderCommentOption(commentOptionTypes.markComplete)}
        {this.renderCommentOption(commentOptionTypes.delete)}
      </div>
    );
  }
}

const styles = {
  commentOptionContainer: {
    float: 'right',
    maxWidth: '179px',
    width: '100%',
    borderColor: color.black,
    border: '2px',
    height: '22px',
    fontSize: '14px',
    color: color.dark_charcoal
  },
  commentOptionItemsContainer: {
    padding: '5px 12px',
    display: 'flex',
    alignItems: 'center'
  }
};
