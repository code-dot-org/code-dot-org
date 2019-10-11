import React from 'react';
import Button from './Button';
import i18n from '@cdo/locale';

export default class AssignButton extends React.Component {
  render() {
    return (
      <Button
        color={Button.ButtonColor.orange}
        text={i18n.assignToSection()}
        icon="plus"
        href="/"
      />
    );
  }
}
