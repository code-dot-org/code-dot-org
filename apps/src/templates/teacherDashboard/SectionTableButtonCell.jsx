import React, {PropTypes} from 'react';
import PrintCertificates from "./PrintCertificates";
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {editedSectionId, removeSection, toggleSectionHidden} from './teacherSectionsRedux';
import Button from '@cdo/apps/templates/Button';
import DeleteAndConfirm from './DeleteAndConfirm';
import {sortableSectionShape} from "./shapes";

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
    sectionData: sortableSectionShape.isRequired,
    handleEdit: PropTypes.func.isRequired,

    //Provided by redux
    editedSectionId: PropTypes.number,
    removeSection: PropTypes.func.isRequired,
    toggleSectionHidden: PropTypes.func.isRequired,
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
    this.props.handleEdit(this.props.sectionData.id);
  };

  onClickHideShow = () => {
    this.props.toggleSectionHidden(this.props.sectionData.id);
  };

  render(){
    const { sectionData, editedSectionId } = this.props;
    return (
      <div>
        <Button
          text={i18n.edit()}
          onClick={this.onClickEdit}
          color={Button.ButtonColor.gray}
          disabled={sectionData.id === editedSectionId}
        />
        <Button
          style={styles.rightButton}
          text={sectionData.hidden ? i18n.show() : i18n.hide()}
          onClick={this.onClickHideShow}
          color={Button.ButtonColor.gray}
          disabled={sectionData.id === editedSectionId}
        />
        <PrintCertificates
          sectionId={sectionData.id}
          assignmentName={sectionData.assignmentNames[0]}
        />
        {sectionData.studentCount === 0 && (
          <DeleteAndConfirm onConfirm={this.onConfirmDelete}/>
        )}
      </div>
    );
  }
}

export const UnconnectedSectionTableButtonCell = SectionTableButtonCell;

export default connect(state => ({
  editedSectionId: editedSectionId(state.teacherSections)
}), {
  removeSection,
  toggleSectionHidden,
})(SectionTableButtonCell);
