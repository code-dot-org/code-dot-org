import React, {Component} from 'react';
import msg from '@cdo/locale';
import javalabMsg from '@cdo/javalab/locale';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';

export default class CommentEditor extends Component {
  state = {
    comment: '',
    isEditing: false
  };

  commentChanged = event => {
    this.setState({
      comment: event.target.value,
      isEditing: true
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
            ...styles.container,
            ...styles.footer,
            justifyContent: 'flex-end'
          }}
        >
          {this.state.isEditing && (
            <Button
              key="cancel"
              text={msg.cancel()}
              onClick={() => this.setState({isEditing: false, comment: ''})}
              color="gray"
              style={{...styles.buttons.all, ...styles.buttons.cancel}}
            />
          )}
          {this.state.isEditing && (
            <Button
              key="submit"
              text={msg.submit()}
              onClick={() => {}}
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
  footer: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 0'
  },
  container: {
    padding: '0 10px'
  }
};
