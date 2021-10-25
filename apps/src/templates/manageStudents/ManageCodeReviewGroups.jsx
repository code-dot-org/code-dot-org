import React from 'react';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';

export default class ManageCodeReviewGroups extends React.Component {
  render() {
    return (
      <div style={styles.button}>
        <Button
          __useDeprecatedTag
          onClick={() => {}}
          color={Button.ButtonColor.gray}
          text={i18n.manageCodeReviewGroups()}
          icon="comment"
        />
      </div>
    );
  }
}

const styles = {
  button: {
    marginLeft: 5
  }
};
