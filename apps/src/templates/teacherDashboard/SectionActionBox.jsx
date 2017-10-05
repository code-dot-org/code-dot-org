import React, {Component, PropTypes} from 'react';
import i18n from '@cdo/locale';
import color from "../../util/color";
import FontAwesome from '../FontAwesome';
import PrintCertificates from "./PrintCertificates";
import {connect} from 'react-redux';
import {editedSectionId, removeSection, toggleSectionHidden} from './teacherSectionsRedux';
import {sortableSectionShape} from "./shapes.jsx";
import {pegasus} from "../../lib/util/urlHelpers";


const styles = {
  arrowIcon: {
    paddingRight: 8
  },
  actionBox: {
    width: 180,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 10,
    paddingTop: 10,
    border: '1px solid ' + color.lighter_gray,
    borderRadius: 2,
    backgroundColor: color.white,
    boxShadow: "2px 2px 2px " + color.light_gray,
  },
  actionText: {
    fontSize: 14,
    fontFamily: '"Gotham", sans-serif',
    color: color.charcoal,
    padding: '10px 0px 4px 0px',
  },
  actionText2: {
    fontSize: 14,
    fontFamily: '"Gotham", sans-serif',
    borderTop: '1px solid ' + color.lighter_gray,
    color: color.charcoal,
    padding: '7px 0px 2px 0px',
    marginTop: '7px',
  },
  archiveDelete: {
    color: color.red,
    padding: '10px 0px 10px 0px',
    fontSize: 14,
  },
  xIcon: {
    paddingRight: 5,
  },
  bold: {
    fontFamily: '"Gotham 5r", sans-serif'
  }
};

/**
 * Buttons for confirming whether or not we want to delete a section
 */
/*export const ConfirmDelete = ({onClickYes, onClickNo}) => (
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
};*/

class SectionActionBox extends Component {
  static propTypes = {
    style: PropTypes.object,
    handleEdit: PropTypes.func,
    sectionData: sortableSectionShape.isRequired,

    //Provided by redux
    editedSectionId: PropTypes.number,
    removeSection: PropTypes.func.isRequired,
    toggleSectionHidden: PropTypes.func.isRequired,
  };

  state = {
    selected: false,
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

  onClickSelect = () => {
    this.setState({selected: !this.state.selected});
  }

  render() {
    return (
      <div>
        <a onClick={this.onClickSelect}> <i className="fa fa-caret-down"></i></a>
        {this.state.selected &&
          <div style={[styles.actionBox, this.props.style]}>
            <a href={pegasus('/teacher-dashboard#/sections/' + this.props.sectionData.id)}>
              <div style={styles.actionText}>
                {i18n.sectionViewProgress()}
              </div>
            </a>
            <a href={pegasus('/teacher-dashboard#/sections/' + this.props.sectionData.id + "/manage")}>
              <div style={styles.actionText}>
                {i18n.manageStudents()}
              </div>
            </a>
            <div href style={styles.actionText2} onClick={this.onClickEdit}>
              {i18n.editSectionDetails()}
            </div>
            <a href={pegasus('/teacher-dashboard#/sections/' + this.props.sectionData.id + '/print_signin_cards')}>
              <div style={styles.actionText}>
                {i18n.printLoginCards()}
              </div>
            </a>
            <div style={styles.actionText}>
              <PrintCertificates
                sectionId={this.props.sectionData.id}
                assignmentName={this.props.sectionData.assignmentNames[0]}
              />
            </div>
            <div style={styles.actionText} onClick={this.onClickHideShow}>
              {this.props.sectionData.hidden ? i18n.showSection() : i18n.hideSection()}
            </div>
            {this.props.sectionData.studentCount === 0 || (
                <div style={styles.archiveDelete}>
                  <FontAwesome icon=" fa-times-circle" style={styles.xIcon}/>
                  {i18n.deleteSection()}
                </div>
            )}
          </div>
        }
      </div>
    );
  }
}

export const UnconnectedSectionActionBox = SectionActionBox;

export default connect(state => ({
  editedSectionId: editedSectionId(state.teacherSections)
}), {
  removeSection,
  toggleSectionHidden,
})(SectionActionBox);
