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
  toggleSectionHidden,
  editedSectionId,
} from './teacherSectionsRedux';
import {styles as tableStyles} from '@cdo/apps/templates/studioHomepages/SectionsTable';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import DeleteAndConfirm from './DeleteAndConfirm';

const styles = {
  link: tableStyles.link,
  col: tableStyles.col,
  courseCol: {
    minWidth: 200,
  },
  lightRow: tableStyles.lightRow,
  darkRow: tableStyles.darkRow,
  row: tableStyles.row,
  sectionCodeNone: {
    color: color.light_gray,
    fontSize: 16,
  },
  rightButton: {
    marginLeft: 5
  },
  nowrap: {
    whiteSpace: 'nowrap'
  },
  currentUnit: {
    marginTop: 10
  },
  colButton: {
    padding: 20,
  }
};

/**
 * Our base buttons (Edit and delete).
 */
export const EditHideShow = ({isHidden, isBeingEdited, onEdit, onToggleHideShow}) => (
  <div style={styles.nowrap}>
    <Button
      text={i18n.edit()}
      onClick={onEdit}
      color={Button.ButtonColor.gray}
      disabled={isBeingEdited}
    />
    <Button
      style={styles.rightButton}
      text={isHidden ? i18n.show() : i18n.hide()}
      onClick={onToggleHideShow}
      color={Button.ButtonColor.gray}
      disabled={isBeingEdited}
    />
  </div>
);
EditHideShow.propTypes = {
  isHidden: PropTypes.bool.isRequired,
  isBeingEdited: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onToggleHideShow: PropTypes.func.isRequired,
};

const ProviderManagedSectionCode = ({provider}) => (
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
    editedSectionId: PropTypes.number,
    removeSection: PropTypes.func.isRequired,
    toggleSectionHidden: PropTypes.func.isRequired,
  };

  state = {
    deleting: false,
  };

  onConfirmDelete = () => {
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

  onClickHideShow = () => {
    const { sectionId, toggleSectionHidden } = this.props;
    toggleSectionHidden(sectionId);
  }

  render() {
    const {
      lightRow,
      sections,
      sectionId,
      validAssignments,
      editedSectionId,
    } = this.props;

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
          <EditHideShow
            isHidden={section.hidden}
            isBeingEdited={section.id === editedSectionId}
            onEdit={this.onClickEdit}
            onToggleHideShow={this.onClickHideShow}
          />
          <PrintCertificates
            sectionId={section.id}
            assignmentName={assignNames[0]}
          />
          {section.studentCount === 0 && (
            <DeleteAndConfirm
              onConfirm={this.onConfirmDelete}
            />
          )}
        </td>
      </tr>
    );
  }
}

export const UnconnectedSectionRow = SectionRow;

export default connect(state => ({
  validAssignments: state.teacherSections.validAssignments,
  sections: state.teacherSections.sections,
  editedSectionId: editedSectionId(state.teacherSections)
}), {
  removeSection,
  toggleSectionHidden,
})(SectionRow);
