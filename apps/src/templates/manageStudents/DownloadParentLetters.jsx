import React, {Component} from 'react';
import Button from '@cdo/apps/templates/Button';

const styles = {
  button: {
    marginLeft: 'auto'
  }
};

export default class DownloadParentLetters extends Component {
  render() {
    return (
      <div style={styles.button}>
        <Button
          __useDeprecatedTag
          onClick={() => {}}
          color={Button.ButtonColor.gray}
          // text={i18n.moveStudents()}
          text="Download parent letters"
        />
      </div>
    );
  }
}
