import PropTypes from 'prop-types';
import React, {Component} from 'react';

import i18n from '@cdo/locale';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {CSVLink} from 'react-csv';
import Button from '@cdo/apps/templates/Button';
import color from '@cdo/apps/util/color';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

const CSV_LOGIN_INFO_HEADERS = [
  {label: 'Section Code', key: 'sectionCode'},
  {label: 'Section Name', key: 'sectionName'},
  {label: 'Student Name', key: 'studentName'},
  {label: 'Secret Words', key: 'secretWords'}
];

export default class LoginDownload extends Component {
  static propTypes = {
    section: PropTypes.object.isRequired,
    students: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);
    let logins = [];
    props.students.forEach(student => {
      logins.push({sectionCode: props.section.code, sectionName: props.section.name, studentName: student.name, secretWords: student.secret_words});
    });
    this.state = {logins};
  }

  render() {
    return (
      <div>
        <CSVLink
          filename="logins.csv"
          data={this.state.logins}
          headers={CSV_LOGIN_INFO_HEADERS}
        >
          <Button
            text="Download logins"
            onClick={() => {}}
            color={Button.ButtonColor.gray}
          />
        </CSVLink>
      </div>
    );
  }
}
