import React, { Component, PropTypes } from 'react';
import i18n from '@cdo/locale';
import ProgressButton from '@cdo/apps/templates/progress/ProgressButton';

const styles = {
  sectionName: {
    fontSize: 18,
    paddingTop: 12
  },
};

export default class SectionRow extends Component {
  static propTypes = {
    // TODO: provide more detail
    section: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      editing: false
    };
  }
  render() {
    const { section } = this.props;
    return (
      <tr>
        <td>
          <span style={styles.sectionName}>
            <a href={`#/sections/${section.id}/`}>
              {section.name}
            </a>
          </span>
        </td>
        <td>
          {section.login_type}
        </td>
        <td>
          {section.grade}
        </td>
        <td>
          Course name/link here
        </td>
        <td>
          {section.stage_extras ? i18n.yes() : i18n.no()}
        </td>
        <td>
          {section.pairing_allowed ? i18n.yes() : i18n.no()}
        </td>
        <td>
          <a href={`#/sections/${section.id}/manage`}>
            {section.students.length}
          </a>
        </td>
        <td>
          {section.code}
        </td>
        <td>
          {/*TODO: i18n */}
          <ProgressButton
            text={"Edit"}
            onClick={() => console.log('click')}
            color={ProgressButton.ButtonColor.gray}
          />
          <ProgressButton
            text={"Print Certificates"}
            onClick={() => console.log('click')}
            color={ProgressButton.ButtonColor.gray}
          />

        </td>
      </tr>
    );
  }
}
