import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '../../util/color';
import {sortableSectionShape, OAuthSectionTypes} from './shapes.jsx';
import PopUpMenu from '@cdo/apps/lib/ui/PopUpMenu';
import i18n from '@cdo/locale';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import {
  sectionCode,
  sectionName,
  removeSection,
  toggleSectionHidden,
  importOrUpdateRoster
} from './teacherSectionsRedux';
import {connect} from 'react-redux';
import PrintCertificates from './PrintCertificates';
import FontAwesome from '../FontAwesome';
import BaseDialog from '../BaseDialog';
import Button from '../Button';
import DialogFooter from './DialogFooter';
import QuickActionsCell from '@cdo/apps/templates/tables/QuickActionsCell';
import {getStore} from '@cdo/apps/redux';
import {setRosterProvider} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {SectionLoginType} from '@cdo/apps/util/sharedConstants';

const styles = {
  xIcon: {
    paddingRight: 5
  },
  heading: {
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderStyle: 'solid',
    borderColor: color.default_text,
    paddingBottom: 20,
    marginBottom: 30
  }
};

class SectionActionDropdown extends Component {
  static propTypes = {
    handleEdit: PropTypes.func,
    sectionData: sortableSectionShape.isRequired,

    //Provided by redux
    removeSection: PropTypes.func.isRequired,
    toggleSectionHidden: PropTypes.func.isRequired,
    sectionCode: PropTypes.string,
    sectionName: PropTypes.string,
    updateRoster: PropTypes.func.isRequired,
    setRosterProvider: PropTypes.func
  };

  state = {
    deleting: false
  };

  componentDidMount() {
    if (
      this.props.sectionData.loginType === OAuthSectionTypes.google_classroom ||
      this.props.sectionData.loginType === OAuthSectionTypes.clever
    ) {
      getStore().dispatch(
        this.props.setRosterProvider(this.props.sectionData.loginType)
      );
    }
  }

  onConfirmDelete = () => {
    const {removeSection} = this.props;
    const section = this.props.sectionData;
    $.ajax({
      url: `/dashboardapi/sections/${section.id}`,
      method: 'DELETE'
    })
      .done(() => {
        removeSection(section.id);
      })
      .fail((jqXhr, status) => {
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

  onClickSync = () => {
    // Section code is the course ID, without the G- or C- prefix.
    const courseId = this.props.sectionCode.replace(/^[GC]-/, '');
    this.props.updateRoster(courseId, this.props.sectionName);
  };

  onRequestDelete = () => {
    this.setState({deleting: true});
  };

  onCancelDelete = () => {
    this.setState({deleting: false});
  };

  render() {
    const {sectionData} = this.props;

    return (
      <span>
        <QuickActionsCell type={'header'}>
          <PopUpMenu.Item
            onClick={this.onClickEdit}
            className="edit-section-details-link"
          >
            {i18n.editSectionDetails()}
          </PopUpMenu.Item>
          <PopUpMenu.Item
            href={teacherDashboardUrl(sectionData.id, '/progress')}
            className="view-progress-link"
          >
            {i18n.sectionViewProgress()}
          </PopUpMenu.Item>
          <PopUpMenu.Item
            href={teacherDashboardUrl(sectionData.id, '/manage_students')}
            className="manage-students-link"
          >
            {i18n.manageStudents()}
          </PopUpMenu.Item>
          {sectionData.loginType !== OAuthSectionTypes.google_classroom &&
            sectionData.loginType !== OAuthSectionTypes.clever && (
              <PopUpMenu.Item
                href={teacherDashboardUrl(sectionData.id, '/login_info')}
                className="print-login-link"
              >
                {sectionData.loginType === SectionLoginType.email
                  ? i18n.joinInstructions()
                  : i18n.printLoginCards()}
              </PopUpMenu.Item>
            )}
          <PrintCertificates
            sectionId={sectionData.id}
            assignmentName={sectionData.assignmentNames[0]}
          />
          {sectionData.loginType === OAuthSectionTypes.clever && (
            <PopUpMenu.Item onClick={this.onClickSync}>
              {i18n.syncClever()}
            </PopUpMenu.Item>
          )}
          {sectionData.loginType === OAuthSectionTypes.google_classroom && (
            <PopUpMenu.Item onClick={this.onClickSync}>
              {i18n.syncGoogleClassroom()}
            </PopUpMenu.Item>
          )}
          <PopUpMenu.Item onClick={this.onClickHideShow}>
            {this.props.sectionData.hidden
              ? i18n.restoreSection()
              : i18n.archiveSection()}
          </PopUpMenu.Item>
          {sectionData.studentCount === 0 && (
            <PopUpMenu.Item onClick={this.onRequestDelete} color={color.red}>
              <FontAwesome icon=" fa-times-circle" style={styles.xIcon} />
              {i18n.deleteSection()}
            </PopUpMenu.Item>
          )}
        </QuickActionsCell>
        <BaseDialog
          useUpdatedStyles
          uncloseable
          isOpen={this.state.deleting}
          style={{paddingLeft: 20, paddingRight: 20, paddingBottom: 20}}
        >
          <h2 style={styles.heading}>{i18n.deleteSection()}</h2>
          <div>{i18n.deleteSectionConfirm()}</div>
          <br />
          <div>{i18n.deleteSectionArchiveSuggestion()}</div>
          <DialogFooter>
            <Button
              __useDeprecatedTag
              class="ui-test-cancel-delete"
              text={i18n.dialogCancel()}
              onClick={this.onCancelDelete}
              color="gray"
            />
            <Button
              __useDeprecatedTag
              class="ui-test-confirm-delete"
              text={i18n.delete()}
              onClick={this.onConfirmDelete}
              color="red"
            />
          </DialogFooter>
        </BaseDialog>
      </span>
    );
  }
}

export const UnconnectedSectionActionDropdown = SectionActionDropdown;

export default connect(
  (state, props) => ({
    sectionCode: sectionCode(state, props.sectionData.id),
    sectionName: sectionName(state, props.sectionData.id)
  }),
  {
    removeSection,
    toggleSectionHidden,
    updateRoster: importOrUpdateRoster,
    setRosterProvider
  }
)(SectionActionDropdown);
