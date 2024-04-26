import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import {LinkButton} from '@cdo/component-library';
import {BodyTwoText} from '@cdo/component-library';
import {studio} from '@cdo/apps/lib/util/urlHelpers';
import i18n from '@cdo/locale';

import ContentContainer from '../ContentContainer';
import AddSectionDialog from '../teacherDashboard/AddSectionDialog';
import OwnedSections from '../teacherDashboard/OwnedSections';
import RosterDialog from '../teacherDashboard/RosterDialog';
import {
  asyncLoadCoteacherInvite,
  asyncLoadSectionData,
  hiddenPlSectionIds,
  hiddenStudentSectionIds,
} from '../teacherDashboard/teacherSectionsRedux';

import CoteacherInviteNotification from './CoteacherInviteNotification';
import SetUpSections from './SetUpSections';

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
      this.props.studentSectionIds?.length > 0 || !!this.props.coteacherInvite
    );
  }

  shouldRenderPlSections() {
    return (
      this.props.plSectionIds?.length > 0 || !!this.props.coteacherInviteForPl
    );
  }

  render() {
    const {studentSectionIds, hiddenStudentSectionIds} = this.props;

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
            <CoteacherInviteNotification isForPl={false} />
            <OwnedSections
              sectionIds={studentSectionIds}
              hiddenSectionIds={hiddenStudentSectionIds}
            />
          </ContentContainer>
        )}
        {this.shouldRenderPlSections() && (
          <ContentContainer heading={i18n.plSectionsTitle()}>
            <BodyTwoText>
              {i18n.myProfessionalLearningSectionsHomepageDesc()}
            </BodyTwoText>
            <LinkButton
              color={'purple'}
              href={studio('/my-professional-learning')}
              iconLeft={{
                iconName: 'book-circle-arrow-right',
                iconStyle: 'solid',
              }}
              size="s"
              text={i18n.myProfessionalLearningSectionsHomepageButton()}
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
