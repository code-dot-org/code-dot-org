import React, {Component} from 'react';
import i18n from '@cdo/locale';
import $ from 'jquery';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import color from '../../util/color';
import PropTypes from 'prop-types';
import Radium from 'radium';

const STANDARD_PADDING = 20;

class PrintCertificates extends Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    assignmentName: PropTypes.string
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

  render() {
    return (
      <form
        style={styles.main}
        ref={element => (this.certForm = element)}
        action={pegasus('/certificates')}
        method="POST"
      >
        <input
          type="hidden"
          name="script"
          defaultValue={this.props.assignmentName}
        />
        {this.state.names.map((name, index) => (
          <input key={index} type="hidden" name="names[]" value={name} />
        ))}
        <div style={styles.outerStyle}>
          <div
            className="uitest-certs-link"
            style={styles.actionText}
            onClick={this.onClickPrintCerts}
          >
            {i18n.printCertificates()}
          </div>
        </div>
      </form>
    );
  }
}

const styles = {
  main: {
    margin: 0
  },
  outerStyle: {
    paddingLeft: STANDARD_PADDING,
    paddingRight: STANDARD_PADDING,
    paddingTop: STANDARD_PADDING / 4,
    paddingBottom: STANDARD_PADDING / 4,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: color.lightest_gray
    }
  },
  actionText: {
    fontSize: 13,
    color: color.dark_charcoal
  }
};

export default Radium(PrintCertificates);
