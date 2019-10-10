import React from 'react';
import Button from './Button';
import i18n from '@cdo/locale';

export default class AssignedButton extends React.Component {
  constructor() {
    super();
    this.state = {text: i18n.assigned(), icon: 'check'};
  }

  onMouseOver = event => {
    this.setState({text: i18n.unassign(), icon: 'times'});
  };

  onMouseOut = event => {
    this.setState({text: i18n.assigned(), icon: 'check'});
  };

  render() {
    const {text, icon} = this.state;
    return (
      <div onMouseOver={this.onMouseOver} onMouseLeave={this.onMouseOut}>
        <Button
          color={Button.ButtonColor.green}
          text={text}
          icon={icon}
          href="/"
        />
      </div>
    );
  }
}
