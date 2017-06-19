import React, { Component } from 'react';
import ProgressButton from '@cdo/apps/templates/progress/ProgressButton';
import { sectionShape } from './shapes';

export default class PrintCertificates extends Component {
  static propTypes = {
    section: sectionShape.isRequired,
  };

  onClickPrintCerts = () => this.certForm.submit();

  render() {
    const { section } = this.props;
    // TODO: i18n
    return (
      <form
        ref={element => this.certForm = element}
        action="/certificates"
        method="POST"
      >
        <input type="hidden" name="script" value={section.assignmentName}/>
        {section.studentNames.map((name, index) => (
          <input key={index} type="hidden" name="names[]" value={name}/>
        ))}
        <ProgressButton
          text={"Print Certificates"}
          onClick={this.onClickPrintCerts}
          color={ProgressButton.ButtonColor.gray}
        />
      </form>
    );
  }
}
