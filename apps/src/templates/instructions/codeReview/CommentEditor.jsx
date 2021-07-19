import React, {Component} from 'react';
import PropTypes from 'prop-types';
import msg from '@cdo/locale';
import javalabMsg from '@cdo/javalab/locale';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';

export default class CommentEditor extends Component {
  static propTypes = {onNewCommentSubmit: PropTypes.func.isRequired};

  state = {comment: ''};

  commentChanged = event => this.setState({comment: event.target.value});

  render() {
    const {comment} = this.state;

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
          {comment && (
            <Button
              key="cancel"
              text={msg.cancel()}
              onClick={() => this.setState({comment: ''})}
              color="gray"
              style={{...styles.buttons.all, ...styles.buttons.cancel}}
            />
          )}
          {comment && (
            <Button
              key="submit"
              text={msg.submit()}
              onClick={() => this.props.onNewCommentSubmit(comment)}
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
