import PropTypes from 'prop-types';
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import {CSVLink} from 'react-csv';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';

const CSV_LOGIN_INFO_HEADERS = [
  {label: i18n.loginExportHeader_sectionCode(), key: 'sectionCode'},
  {label: i18n.loginExportHeader_sectionName(), key: 'sectionName'},
  {label: i18n.loginExportHeader_sectionLoginType(), key: 'sectionLoginType'},
  {label: i18n.loginExportHeader_studentName(), key: 'studentName'},
  {
    label: i18n.loginExportHeader_studentLoginSecret(),
    key: 'studentLoginSecret'
  }
];

export default class LoginExport extends Component {
  static propTypes = {
    sectionCode: PropTypes.string,
    sectionName: PropTypes.string,
    sectionLoginType: PropTypes.string,
    students: PropTypes.array
  };

  constructor(props) {
    super(props);
    let logins = [];

    if (props.students) {
      props.students.forEach(student => {
        if (student.username !== '') {
          logins.push({
            sectionCode: props.sectionCode,
            sectionName: props.sectionName,
            sectionLoginType: props.sectionLoginType,
            studentName: student.name,
            studentLoginSecret:
              props.sectionLoginType === SectionLoginType.word
                ? student.secretWords
                : pegasus(`/images/${student.secretPicturePath}`)
          });
        }
      });
    }
    this.state = {logins};
  }

  render() {
    return (
      <div style={{display: 'inline'}}>
        <CSVLink
          filename={`${i18n.loginExportFilename()}.csv`}
          data={this.state.logins}
          headers={CSV_LOGIN_INFO_HEADERS}
        >
          {i18n.loginExportLink()}
        </CSVLink>
      </div>
    );
  }
}
