import React from 'react';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';

export default class ManageCodeReviewGroups extends React.Component {
  render() {
    return (
      <div style={styles.button}>
        {/* use div instead of button HTML element for consistent spacing with other "buttons" in ManageStudentsTable header */}
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
