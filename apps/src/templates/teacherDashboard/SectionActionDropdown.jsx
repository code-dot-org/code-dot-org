import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import Button from '@cdo/apps/legacySharedComponents/Button';
import {OAuthSectionTypes} from '@cdo/apps/lib/ui/accounts/constants';
import PopUpMenu from '@cdo/apps/lib/ui/PopUpMenu';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/utils/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/utils/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import QuickActionsCell from '@cdo/apps/templates/tables/QuickActionsCell';
import {setRosterProvider} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import {SectionLoginType} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import color from '../../util/color';
import BaseDialog from '../BaseDialog';
import FontAwesome from '../FontAwesome';

import DialogFooter from './DialogFooter';
import PrintCertificates from './PrintCertificates';
import {sortableSectionShape} from './shapes.jsx';
import {
  sectionCode,
  sectionName,
  removeSection,
  toggleSectionHidden,
  importOrUpdateRoster,
} from './teacherSectionsRedux';

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
    setRosterProvider: PropTypes.func,
  };

  state = {
    deleting: false,
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
      method: 'DELETE',
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

  /**
   * Returns the URL to the correct section to be edited
   */
  editRedirectUrl = (sectionId, isPl) => {
    let editSectionUrl = '/sections/' + sectionId + '/edit';
    editSectionUrl += isPl ? '?redirectToPage=my-professional-learning' : '';
    return editSectionUrl;
  };

  /**
   * Creates the pop-up for the section to be edited
   */
  onClickEditPopUp = () => {
    return this.props.handleEdit(this.props.sectionData.id);
  };

  onClickHideShow = () => {
    const hideShowEvent = this.props.sectionData.hidden
      ? EVENTS.SECTION_TABLE_RESTORE_SECTION_CLICKED
      : EVENTS.SECTION_TABLE_ARCHIVE_SECTION_CLICKED;
    analyticsReporter.sendEvent(hideShowEvent, {}, PLATFORMS.BOTH);
    this.props.toggleSectionHidden(this.props.sectionData.id);
  };

  onClickSync = () => {
    const {loginType} = this.props.sectionData;

    switch (loginType) {
      case OAuthSectionTypes.google_classroom:
        analyticsReporter.sendEvent(
          EVENTS.SECTION_TABLE_SYNC_GOOGLE_CLASSROOM_CLICKED,
          {},
          PLATFORMS.BOTH
        );
        break;
      case OAuthSectionTypes.clever:
        analyticsReporter.sendEvent(
          EVENTS.SECTION_TABLE_SYNC_CLEVER_CLICKED,
          {},
          PLATFORMS.BOTH
        );
        break;
    }
    // Section code is the course ID, without the G- or C- prefix.
    const courseId = this.props.sectionCode.replace(/^[GC]-/, '');
    this.props.updateRoster(courseId, this.props.sectionName);
  };

  onRequestDelete = () => {
    analyticsReporter.sendEvent(
      EVENTS.SECTION_TABLE_DELETE_SECTION_CLICKED,
      {},
      PLATFORMS.BOTH
    );
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
            href={this.editRedirectUrl(
              sectionData.id,
              sectionData.grades?.includes('pl')
            )}
            className="edit-section-details-link"
            hrefOnClick={() => {
              analyticsReporter.sendEvent(
                EVENTS.SECTION_TABLE_EDIT_SECTION_DETAILS_CLICKED,
                {},
                PLATFORMS.BOTH
              );
            }}
          >
            {i18n.editSectionDetails()}
          </PopUpMenu.Item>
          <PopUpMenu.Item
            href={teacherDashboardUrl(sectionData.id, '/progress')}
            className="view-progress-link"
            hrefOnClick={() => {
              analyticsReporter.sendEvent(
                EVENTS.SECTION_TABLE_VIEW_PROGRESS_CLICKED,
                {},
                PLATFORMS.BOTH
              );
            }}
          >
            {i18n.sectionViewProgress()}
          </PopUpMenu.Item>
          <PopUpMenu.Item
            href={teacherDashboardUrl(sectionData.id, '/manage_students')}
            className="manage-students-link"
            hrefOnClick={() => {
              analyticsReporter.sendEvent(
                EVENTS.SECTION_TABLE_MANAGE_STUDENTS_CLICKED,
                {},
                PLATFORMS.BOTH
              );
            }}
          >
            {i18n.manageStudents()}
          </PopUpMenu.Item>
          {sectionData.loginType !== OAuthSectionTypes.google_classroom &&
            sectionData.loginType !== OAuthSectionTypes.clever && (
              <PopUpMenu.Item
                href={teacherDashboardUrl(sectionData.id, '/login_info')}
                className="print-login-link"
                hrefOnClick={() => {
                  const loginInstructionsEvent =
                    sectionData.loginType === SectionLoginType.email
                      ? EVENTS.SECTION_TABLE_JOIN_INSTRUCTIONS_CLICKED
                      : EVENTS.SECTION_TABLE_PRINT_LOGIN_CARDS_CLICKED;
                  analyticsReporter.sendEvent(
                    loginInstructionsEvent,
                    {},
                    PLATFORMS.BOTH
                  );
                }}
              >
                {sectionData.loginType === SectionLoginType.email
                  ? i18n.joinInstructions()
                  : i18n.printLoginCards()}
              </PopUpMenu.Item>
            )}
          <PrintCertificates
            sectionId={sectionData.id}
            courseVersionName={sectionData.courseVersionName}
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
              class="ui-test-cancel-delete"
              text={i18n.dialogCancel()}
              onClick={this.onCancelDelete}
              color="gray"
              style={{margin: 0}}
            />
            <Button
              class="ui-test-confirm-delete"
              text={i18n.delete()}
              onClick={this.onConfirmDelete}
              color="red"
              style={{margin: 0}}
            />
          </DialogFooter>
        </BaseDialog>
      </span>
    );
  }
}

const styles = {
  xIcon: {
    paddingRight: 5,
  },
  heading: {
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderStyle: 'solid',
    borderColor: color.default_text,
    paddingBottom: 20,
    marginBottom: 30,
  },
};

export const UnconnectedSectionActionDropdown = SectionActionDropdown;

export default connect(
  (state, props) => ({
    sectionCode: sectionCode(state, props.sectionData.id),
    sectionName: sectionName(state, props.sectionData.id),
  }),
  {
    removeSection,
    toggleSectionHidden,
    updateRoster: importOrUpdateRoster,
    setRosterProvider,
  }
)(SectionActionDropdown);
