import React, {Component, PropTypes} from 'react';
import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';
import $ from 'jquery';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

export default class PrintCertificates extends Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    assignmentName: PropTypes.string,
  };

  state = {
    names: [],
  };

  onClickPrintCerts = () => {
    $.ajax(`/v2/sections/${this.props.sectionId}/students`).done(result => {
      const names = result.map(student => student.name);
      this.setState({names}, this.submitForm);
    });
  };

  submitForm = () => {
    this.certForm.submit();
  };

  render() {
    return (
      <form
        ref={element => this.certForm = element}
        action={pegasus('/certificates')}
        method="POST"
      >
        <input type="hidden" name="script" value={this.props.assignmentName}/>
        {this.state.names.map((name, index) => (
          <input key={index} type="hidden" name="names[]" value={name}/>
        ))}
        <Button
          text={i18n.printCertificates()}
          onClick={this.onClickPrintCerts}
          color={Button.ButtonColor.gray}
        />
      </form>
    );
  }
}
