import React, {PropTypes} from 'react';
import sectionTablePropType from './SectionTable';
import PrintCertificates from "./PrintCertificates";
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {removeSection} from './teacherSectionsRedux';
import Button from '@cdo/apps/templates/Button';

const styles = {
  rightButton: {
    marginLeft: 5
  },
  nowrap: {
    whiteSpace: 'nowrap'
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

class SectionTableButtonCell extends React.Component {
  static propTypes = {
    sectionData: PropTypes.shape(sectionTablePropType).isRequired,
    handleEdit: PropTypes.func,

    //Provided by redux
    removeSection: PropTypes.func,
  };
  state = {
    deleting: false,
  };

  onClickDeleteYes = () => {
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
    return (
      <div>
        {!this.state.deleting && (
          <EditOrDelete
            canDelete={this.props.sectionData.studentCount === 0}
            onEdit={this.onClickEdit}
            onDelete={() => {this.setState({deleting: true});}}
          />
        )}
        {this.state.deleting && (
          <ConfirmDelete
            onClickYes={this.onClickDeleteYes}
            onClickNo={() => {this.setState({deleting: false});}}
          />
        )}
        <PrintCertificates
          sectionId={this.props.sectionData.id}
          assignmentName={this.props.sectionData.assignmentName[0]}
        />
      </div>
    );
  }
}

export const UnconnectedSectionTableButtonCell = SectionTableButtonCell;

export default connect(null, {
  removeSection,
})(SectionTableButtonCell);
