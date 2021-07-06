import React, {Component} from 'react';
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
          placeholder={'Add a comment...'}
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
              text={'cancel'}
              onClick={() => this.setState({isEditing: false, comment: ''})}
              color="gray"
              style={styles.buttons.all}
            />
          )}
          {this.state.isEditing && (
            <Button
              key="confirm"
              text={'confirm'}
              onClick={() => {}}
              color="orange"
              style={{...styles.buttons.all, ...styles.buttons.confirmation}}
            />
          )}
        </div>
      </div>
    );
  }
}

const GUTTER = 20;
const styles = {
  buttons: {
    all: {boxShadow: 'none'},
    confirmation: {borderColor: color.orange}
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    padding: `${GUTTER / 2}px 0`
  },
  container: {
    padding: `0 ${GUTTER}px`
  }
};
