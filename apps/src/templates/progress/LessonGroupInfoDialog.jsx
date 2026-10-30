import Modal from '@code-dot-org/component-library/modal';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import LessonGroupInfo from '@cdo/apps/templates/progress/LessonGroupInfo';
import i18n from '@cdo/locale';

// Dialog with information about a lesson group
export default class LessonGroupInfoDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    displayName: PropTypes.string.isRequired,
    description: PropTypes.string,
    closeDialog: PropTypes.func,
    bigQuestions: PropTypes.string,
  };

  render() {
    if (!this.props.isOpen) {
      return null;
    }
    return (
      <Modal
        onClose={this.props.closeDialog}
        title={this.props.displayName}
        customContent={
          <div id="dsco-dialog-description">
            <LessonGroupInfo
              description={this.props.description}
              bigQuestions={this.props.bigQuestions}
            />
          </div>
        }
        primaryButtonProps={{
          variant: 'outlined',
          color: 'secondary',
          onClick: this.props.closeDialog,
          children: i18n.closeDialog(),
        }}
      />
    );
  }
}
