import React, {Component} from 'react';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';

export default class CommentEditor extends Component {
  render() {
    return (
      <div>
        <textarea style={{width: '100%'}}>hey how are ya</textarea>
        <div
          style={{
            ...styles.container,
            ...styles.footer,
            justifyContent: 'flex-end'
          }}
        >
          <Button
            key="cancel"
            text={'cancel'}
            onClick={() => {}}
            color="gray"
            style={styles.buttons.all}
          />
          <Button
            key="confirm"
            text={'confirm'}
            onClick={() => {}}
            color="orange"
            style={{...styles.buttons.all, ...styles.buttons.confirmation}}
          />
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
    padding: `${GUTTER / 2}px ${GUTTER - 3}px` // -3 to account for 3px-margin around <Button/>
  },
  container: {
    padding: `0 ${GUTTER}px`
  }
};
