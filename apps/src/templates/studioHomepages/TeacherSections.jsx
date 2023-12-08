import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import ContentContainer from '../ContentContainer';
import OwnedSections from '../teacherDashboard/OwnedSections';
import {
  asyncLoadCoteacherInvite,
  asyncLoadSectionData,
  hiddenPlSectionIds,
  hiddenStudentSectionIds,
} from '../teacherDashboard/teacherSectionsRedux';
import SetUpSections from './SetUpSections';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import RosterDialog from '../teacherDashboard/RosterDialog';
import AddSectionDialog from '../teacherDashboard/AddSectionDialog';
import CoteacherInviteNotification, {
  showCoteacherInviteNotification,
} from './CoteacherInviteNotification';

class TeacherSections extends Component {
  static propTypes = {
    //Redux provided
    asyncLoadSectionData: PropTypes.func.isRequired,
    asyncLoadCoteacherInvite: PropTypes.func.isRequired,
    coteacherInvite: PropTypes.object,
    coteacherInviteForPl: PropTypes.object,
    studentSectionIds: PropTypes.array,
    plSectionIds: PropTypes.array,
    hiddenPlSectionIds: PropTypes.arrayOf(PropTypes.number).isRequired,
    hiddenStudentSectionIds: PropTypes.arrayOf(PropTypes.number).isRequired,
    sectionsAreLoaded: PropTypes.bool,
  };

  componentDidMount() {
    this.props.asyncLoadSectionData();
    this.props.asyncLoadCoteacherInvite();
  }

  shouldRenderSections() {
    return (
      this.props.studentSectionIds?.length > 0 ||
      showCoteacherInviteNotification(this.props.coteacherInvite)
    );
  }

  render() {
    const {
      plSectionIds,
      studentSectionIds,
      hiddenPlSectionIds,
      hiddenStudentSectionIds,
    } = this.props;

    return (
      <div id="classroom-sections">
        <ContentContainer heading={i18n.createSection()}>
          <SetUpSections />
          {!this.props.sectionsAreLoaded && (
            <Spinner size="large" style={styles.spinner} />
          )}
        </ContentContainer>
        {this.shouldRenderSections() && (
          <ContentContainer heading={i18n.sectionsTitle()}>
            <CoteacherInviteNotification />
            <OwnedSections
              sectionIds={studentSectionIds}
              hiddenSectionIds={hiddenStudentSectionIds}
            />
          </ContentContainer>
        )}
        {this.props.plSectionIds?.length > 0 && (
          <ContentContainer heading={i18n.plSectionsTitle()}>
            <OwnedSections
              isPlSections={true}
              sectionIds={plSectionIds}
              hiddenSectionIds={hiddenPlSectionIds}
            />
          </ContentContainer>
        )}
        <RosterDialog />
        <AddSectionDialog />
      </div>
    );
  }
}
export const UnconnectedTeacherSections = TeacherSections;
export default connect(
  state => ({
    coteacherInvite: state.teacherSections.coteacherInvite,
    coteacherInviteForPl: state.teacherSections.coteacherInviteForPl,
    studentSectionIds: state.teacherSections.studentSectionIds,
    plSectionIds: state.teacherSections.plSectionIds,
    hiddenPlSectionIds: hiddenPlSectionIds(state),
    hiddenStudentSectionIds: hiddenStudentSectionIds(state),
    sectionsAreLoaded: state.teacherSections.sectionsAreLoaded,
  }),
  {
    asyncLoadCoteacherInvite,
    asyncLoadSectionData,
  }
)(TeacherSections);

const styles = {
  spinner: {
    marginTop: '10px',
  },
};
