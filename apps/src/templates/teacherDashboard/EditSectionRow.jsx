import React, { Component, PropTypes } from 'react';
import i18n from '@cdo/locale';
import ProgressButton from '@cdo/apps/templates/progress/ProgressButton';
import sectionShape from './sectionShape';

const styles = {
  sectionName: {
    fontSize: 18,
    paddingTop: 12
  },
  nowrap: {
    whiteSpace: 'nowrap'
  }
};

export default class SectionRow extends Component {
  static propTypes = {
    section: sectionShape.isRequired,
    onClickSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  onClickEditSave = () => console.log('this is where our save will happen');

  render() {
    const { section, onClickSave, onCancel } = this.props;

    return (
      <tr>
        <td>
          <span style={styles.sectionName}>
            <a href={`#/sections/${section.id}/`}>
              EDIT: {section.name}
            </a>
          </span>
        </td>
        <td>
          {section.loginType}
        </td>
        <td>
          {section.grade}
        </td>
        <td>
          {section.assignmentName &&
            <a href={section.assignmentPath}>
              {section.assignmentName}
            </a>
          }
        </td>
        <td>
          {section.stageExtras ? i18n.yes() : i18n.no()}
        </td>
        <td>
          {section.pairingAllowed ? i18n.yes() : i18n.no()}
        </td>
        <td>
          <a href={`#/sections/${section.id}/manage`}>
            {section.numStudents}
          </a>
        </td>
        <td>
          {section.code}
        </td>
        <td>
          <div style={styles.nowrap}>
            <ProgressButton
              text={i18n.save()}
              onClick={onClickSave}
              color={ProgressButton.ButtonColor.blue}
            />
            <ProgressButton
              text={i18n.dialogCancel()}
              style={{marginLeft: 5}}
              onClick={onCancel}
              color={ProgressButton.ButtonColor.gray}
            />
          </div>
        </td>
      </tr>
    );
  }
}
