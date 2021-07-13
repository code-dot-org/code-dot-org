import React, {Component} from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
import {getStore} from '@cdo/apps/redux';
import msg from '@cdo/locale';
import javalabMsg from '@cdo/javalab/locale';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';

export default class CommentEditor extends Component {
  static propTypes = {
    onNewCommentSubmit: PropTypes.func.isRequired,
    token: PropTypes.string.isRequired
  };

  state = {comment: ''};

  commentChanged = event => this.setState({comment: event.target.value});

  submitNewComment = () => {
    $.ajax({
      url: `/code_review_comments`,
      type: 'POST',
      headers: {'X-CSRF-Token': this.props.token},
      data: {
        channel_id: getStore().getState().pageConstants.channelId,
        project_version: 'latest',
        comment: this.state.comment
      }
    }).done(result => {
      this.setState({comment: ''});
      this.props.onNewCommentSubmit(result);
    });
  };

  render() {
    return (
      <div>
        <textarea
          style={{width: '100%', boxSizing: 'border-box'}}
          placeholder={`${javalabMsg.addAComment()}...`}
          onChange={this.commentChanged}
          value={this.state.comment}
        />
        <div
          style={{
            ...styles.buttonContainer
          }}
        >
          {this.state.comment && (
            <Button
              key="cancel"
              text={msg.cancel()}
              onClick={() => this.setState({comment: ''})}
              color="gray"
              style={{...styles.buttons.all, ...styles.buttons.cancel}}
            />
          )}
          {this.state.comment && (
            <Button
              key="submit"
              text={msg.submit()}
              onClick={this.submitNewComment}
              color="orange"
              style={{...styles.buttons.all, ...styles.buttons.submit}}
            />
          )}
        </div>
      </div>
    );
  }
}

const styles = {
  buttons: {
    all: {
      boxShadow: 'none',
      fontSize: '14px',
      padding: '5px 16px'
    },
    submit: {
      fontFamily: '"Gotham 5r"',
      borderColor: color.orange
    },
    cancel: {
      fontFamily: '"Gotham 4r"',
      borderColor: color.lightest_gray
    }
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '10px 0'
  }
};
