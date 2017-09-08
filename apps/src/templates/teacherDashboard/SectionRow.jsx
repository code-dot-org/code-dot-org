import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import Button from '@cdo/apps/templates/Button';
import {sectionShape, assignmentShape} from './shapes';
import PrintCertificates from './PrintCertificates';
import {
  assignmentNames,
  assignmentPaths,
  removeSection,
} from './teacherSectionsRedux';
import {styles as tableStyles} from '@cdo/apps/templates/studioHomepages/SectionsTable';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

const styles = {
  link: tableStyles.link,
  col: tableStyles.col,
  courseCol: {
    minWidth: 200,
  },
  lightRow: tableStyles.lightRow,
  darkRow: tableStyles.darkRow,
  row: tableStyles.row,
  rightButton: {
    marginLeft: 5
  },
  sectionCodeNone: {
    color: color.light_gray,
    fontSize: 16,
  },
  nowrap: {
    whiteSpace: 'nowrap'
  },
  currentUnit: {
    marginTop: 10
  },
  colButton: {
    paddingTop: 20,
    paddingLeft: 20,
  }
};

/**
 * Our base buttons (Edit and delete).
 */
export const EditOrDelete = ({canDelete, onEdit, onDelete}) => (
  <div style={styles.nowrap}>
    <Button
      text={i18n.edit()}
      onClick={onEdit}
      color={Button.ButtonColor.gray}
    />
    {canDelete && (
      <Button
        style={{marginLeft: 5}}
        text={i18n.delete()}
        onClick={onDelete}
        color={Button.ButtonColor.red}
      />
    )}
  </div>
);
EditOrDelete.propTypes = {
  canDelete: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

/**
 * Buttons for confirming whether or not we want to delete a section
 */
export const ConfirmDelete = ({onClickYes, onClickNo}) => (
  <div style={styles.nowrap}>
    <div>{i18n.deleteConfirm()}</div>
    <Button
      text={i18n.yes()}
      onClick={onClickYes}
      color={Button.ButtonColor.red}
    />
    <Button
      text={i18n.no()}
      style={styles.rightButton}
      onClick={onClickNo}
      color={Button.ButtonColor.gray}
    />
  </div>
);
ConfirmDelete.propTypes = {
  onClickYes: PropTypes.func.isRequired,
  onClickNo: PropTypes.func.isRequired,
};

export const ProviderManagedSectionCode = ({provider}) => (
  <div data-tip={i18n.providerManagedSection({provider})}>
    {i18n.none()}
    &nbsp;
    <i
      className="fa fa-question-circle"
      style={styles.sectionCodeNone}
    />
    <ReactTooltip
      role="tooltip"
      effect="solid"
    />
  </div>
);
ProviderManagedSectionCode.propTypes = {
  provider: PropTypes.string.isRequired,
};

/**
 * A component for displaying information about a particular section
 * in the teacher dashboard.
 */
class SectionRow extends Component {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    lightRow: PropTypes.bool.isRequired,
    handleEdit: PropTypes.func,

    // redux provided
    validAssignments: PropTypes.objectOf(assignmentShape).isRequired,
    sections: PropTypes.objectOf(sectionShape).isRequired,
    removeSection: PropTypes.func.isRequired,
  };

  state = {
    deleting: false,
  };

  onClickDelete = () => this.setState({deleting: true});

  onClickDeleteNo = () => this.setState({deleting: false});

  onClickDeleteYes = () => {
    const { sections, sectionId, removeSection } = this.props;
    const section = sections[sectionId];
    $.ajax({
      url: `/v2/sections/${section.id}`,
      method: 'DELETE',
    }).done(() => {
      removeSection(section.id);
    }).fail((jqXhr, status) => {
      // We may want to handle this more cleanly in the future, but for now this
      // matches the experience we got in angular
      alert(i18n.unexpectedError());
      console.error(status);
    });
  };

  onClickEdit = () => {
    const section = this.props.sections[this.props.sectionId];
    const editData = {
      id: this.props.sectionId,
      name: section.name,
      grade: section.grade,
      course: section.course_id,
      extras: section.stageExtras,
      pairing: section.pairingAllowed,
      sectionId: this.props.sectionId
    };
    this.props.handleEdit(editData);
  };

  render() {
    const {
      lightRow,
      sections,
      sectionId,
      validAssignments,
    } = this.props;
    const {deleting} = this.state;

    const section = sections[sectionId];
    if (!section) {
      return null;
    }
    const assignNames = assignmentNames(validAssignments, section);
    const assignPaths = assignmentPaths(validAssignments, section);

    let sectionCode = '';
    if (section.providerManaged) {
      sectionCode = <ProviderManagedSectionCode provider={section.loginType}/>;
    } else {
      sectionCode = section.code;
    }

    const manageSectionUrl = pegasus(`/teacher-dashboard#/sections/${section.id}/`);
    const manageStudentsUrl = pegasus(`/teacher-dashboard#/sections/${section.id}/manage`);

    return (
      <tr
        style={{
          ...(lightRow ? styles.lightRow : styles.darkRow),
          ...styles.row
        }}
      >
        <td style={styles.col}>
          <a href={manageSectionUrl} style={styles.link}>
            {section.name}
          </a>
        </td>
        <td style={styles.col}>
          {section.grade}
        </td>
        <td style={{...styles.col, ...styles.courseCol}}>
          {assignNames[0] &&
            <a href={assignPaths[0]} style={styles.link}>
              {assignNames[0]}
            </a>
          }
          {assignNames[1] &&
            <div style={styles.currentUnit}>
              {i18n.currentUnit()}
              <div>
                <a href={assignPaths[1]} style={styles.link}>
                  {assignNames[1]}
                </a>
              </div>
            </div>
          }
        </td>
        <td style={styles.col}>
          <a href={manageStudentsUrl} style={styles.link}>
            {section.studentCount <= 0 ? i18n.addStudents() : section.studentCount}
          </a>
        </td>
        <td style={styles.col}>
          {sectionCode}
        </td>
        <td style={styles.col && styles.colButton}>
          {!deleting && (
            <EditOrDelete
              canDelete={section.studentCount === 0}
              onEdit={this.onClickEdit}
              onDelete={this.onClickDelete}
            />
          )}
          {deleting && (
            <ConfirmDelete
              onClickYes={this.onClickDeleteYes}
              onClickNo={this.onClickDeleteNo}
            />
          )}
          <PrintCertificates
            sectionId={section.id}
            assignmentName={assignNames[0]}
          />
        </td>
      </tr>
    );
  }
}

export const UnconnectedSectionRow = SectionRow;

export default connect(state => ({
  validAssignments: state.teacherSections.validAssignments,
  sections: state.teacherSections.sections,
}), {
  removeSection,
})(SectionRow);
