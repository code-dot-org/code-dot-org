import React, {Component} from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import $ from 'jquery';
import i18n from '@cdo/locale';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import style from './print-certificates.module.scss';
import experiments from '@cdo/apps/util/experiments';
import RailsAuthenticityToken from '@cdo/apps/lib/util/RailsAuthenticityToken';

class PrintCertificates extends Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    // TODO(dave): remove assignmentName prop after launching studioCertificate experiment
    assignmentName: PropTypes.string,
    courseVersionName: PropTypes.string
  };

  state = {
    names: []
  };

  onClickPrintCerts = () => {
    $.ajax(`/dashboardapi/sections/${this.props.sectionId}/students`).done(
      result => {
        const names = result.map(student => student.name);
        this.setState({names}, this.submitForm);
      }
    );
  };

  submitForm = () => {
    this.certForm.submit();
  };

  certificateUrl = () => {
    if (experiments.isEnabled(experiments.STUDIO_CERTIFICATE)) {
      return '/certificates/batch';
    } else {
      return pegasus('/certificates');
    }
  };

  render() {
    const {courseVersionName} = this.props;

    return (
      <form
        className={style.main}
        ref={element => (this.certForm = element)}
        action={this.certificateUrl()}
        method="POST"
      >
        <RailsAuthenticityToken />
        <input
          type="hidden"
          name="script"
          defaultValue={this.props.assignmentName}
        />
        {courseVersionName && (
          <input type="hidden" name="course" value={btoa(courseVersionName)} />
        )}
        {this.state.names.map((name, index) => (
          <input key={index} type="hidden" name="names[]" value={name} />
        ))}
        <div className={style.outerStyle}>
          <div
            className={classNames('uitest-certs-link', style.actionText)}
            onClick={this.onClickPrintCerts}
          >
            {i18n.printCertificates()}
          </div>
        </div>
      </form>
    );
  }
}

export default PrintCertificates;
