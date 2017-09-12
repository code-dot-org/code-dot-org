import React, {PropTypes} from 'react';
import sectionTablePropType from './SectionTable';
import PrintCertificates from "./PrintCertificates";
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {removeSection} from './teacherSectionsRedux';
import Button from '@cdo/apps/templates/Button';
import DeleteAndConfirm from './DeleteAndConfirm';

const styles = {
  rightButton: {
    marginLeft: 5
  },
  nowrap: {
    whiteSpace: 'nowrap'
  }
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

class SectionTableButtonCell extends React.Component {
  static propTypes = {
    sectionData: PropTypes.shape(sectionTablePropType).isRequired,
    handleEdit: PropTypes.func,

    //Provided by redux
    removeSection: PropTypes.func,
  };

  onConfirmDelete = () => {
    const {removeSection } = this.props;
    const section = this.props.sectionData;
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
    const section = this.props.sectionData;
    const editData = {
      id: section.id,
      name: section.name,
      grade: section.grade,
      course: section.course_id,
      extras: section.stageExtras,
      pairing: section.pairingAllowed,
      sectionId: section.id
    };
    this.props.handleEdit(editData);
  };

  render(){
    const { sectionData } = this.props;
    return (
      <div>
        <Button
          text={i18n.edit()}
          onClick={this.onClickEdit}
          color={Button.ButtonColor.gray}
        />
        <PrintCertificates
          sectionId={sectionData.id}
          assignmentName={sectionData.assignmentName[0]}
        />
        {sectionData.studentCount === 0 && (
          <DeleteAndConfirm onConfirm={this.onConfirmDelete}/>
        )}
      </div>
    );
  }
}

export const UnconnectedSectionTableButtonCell = SectionTableButtonCell;

export default connect(null, {
  removeSection,
})(SectionTableButtonCell);
