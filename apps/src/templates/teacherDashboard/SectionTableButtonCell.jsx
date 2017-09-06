import React, {PropTypes} from 'react';
import sectionTablePropType from './SectionTable';
import {EditOrDelete, ConfirmDelete} from "./SectionRow";
import PrintCertificates from "./PrintCertificates";
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {removeSection} from './teacherSectionsRedux';

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
