import classNames from 'classnames';
import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/utils/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/utils/AnalyticsReporter';
import RailsAuthenticityToken from '@cdo/apps/util/RailsAuthenticityToken';
import i18n from '@cdo/locale';

import style from './print-certificates.module.scss';

class PrintCertificates extends Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    courseVersionName: PropTypes.string,
  };

  state = {
    names: [],
  };

  onClickPrintCerts = () => {
    analyticsReporter.sendEvent(
      EVENTS.SECTION_TABLE_PRINT_CERTIFICATES_CLICKED,
      {},
      PLATFORMS.BOTH
    );
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

  certificateUrl = () => '/certificates/batch';

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
