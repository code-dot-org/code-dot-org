import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import HeaderBanner from '../HeaderBanner';
import SpecialAnnouncement from './SpecialAnnouncement';
import Notification from '../Notification';
import {SpecialAnnouncementActionBlock} from './TwoColumnActionBlock';
import RecentCourses from './RecentCourses';
import TeacherSections from './TeacherSections';
import StudentSections from './StudentSections';
import TeacherResources from './TeacherResources';
import ProjectWidgetWithData from '@cdo/apps/templates/projects/ProjectWidgetWithData';
import shapes from './shapes';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import i18n from '@cdo/locale';
import CensusTeacherBanner from '../census2017/CensusTeacherBanner';
import DonorTeacherBanner from '@cdo/apps/templates/DonorTeacherBanner';
import {beginGoogleImportRosterFlow} from '../teacherDashboard/teacherSectionsRedux';

const styles = {
  clear: {
    clear: 'both',
    height: 30
  }
};

export class UnconnectedTeacherHomepage extends Component {
  static propTypes = {
    joinedSections: shapes.sections,
    hocLaunch: PropTypes.string,
    courses: shapes.courses,
    topCourse: shapes.topCourse,
    announcement: shapes.teacherAnnouncement,
    queryStringOpen: PropTypes.string,
    canViewAdvancedTools: PropTypes.bool,
    isEnglish: PropTypes.bool.isRequired,
    ncesSchoolId: PropTypes.string,
    showCensusBanner: PropTypes.bool.isRequired,
    donorBannerName: PropTypes.string,
    censusQuestion: PropTypes.oneOf(['how_many_10_hours', 'how_many_20_hours']),
    teacherName: PropTypes.string,
    teacherId: PropTypes.number,
    teacherEmail: PropTypes.string,
    schoolYear: PropTypes.number,
    specialAnnouncement: shapes.specialAnnouncement,
    beginGoogleImportRosterFlow: PropTypes.func
  };

  state = {
    showCensusBanner: this.props.showCensusBanner,
    donorBannerName: this.props.donorBannerName
  };

  bindCensusBanner = banner => {
    this.censusBanner = banner;
  };

  handleCensusBannerTeachesChange(event) {
    this.setState({
      censusBannerTeachesSelection: event.target.id === 'teachesYes'
    });
  }

  handleCensusBannerInClassChange(event) {
    this.setState({
      censusBannerInClassSelection: event.target.id === 'inClass'
    });
  }

  handleCensusBannerSubmit() {
    if (this.censusBanner.isValid()) {
      $.ajax({
        url: '/dashboardapi/v1/census/CensusTeacherBannerV1',
        type: 'post',
        dataType: 'json',
        data: this.censusBanner.getData()
      })
        .done(this.handleCensusSubmitSuccess)
        .fail(this.handleCensusSubmitError);
    } else {
      this.setState({showCensusInvalidError: true});
    }
  }

  handleCensusSubmitSuccess = () => {
    this.setState({censusSubmittedSuccessfully: true});
    this.dismissCensusBanner(null, this.logDismissCensusBannerError);
  };

  handleCensusSubmitError = () => {
    this.setState({
      showCensusUnknownError: true
    });
  };

  dismissCensusBanner(onSuccess, onFailure) {
    $.ajax({
      url: `/api/v1/users/${this.props.teacherId}/dismiss_census_banner`,
      type: 'post'
    })
      .done(onSuccess)
      .fail(onFailure);
  }

  logDismissCensusBannerError = xhr => {
    console.error(
      `Failed to dismiss future census banner! ${xhr.responseText}`
    );
  };

  hideCensusBanner = () => {
    this.setState({
      showCensusBanner: false
    });
  };

  dismissAndHideCensusBanner() {
    this.dismissCensusBanner(
      this.hideCensusBanner,
      this.handleDismissAndHideCensusBannerError
    );
  }

  handleDismissAndHideCensusBannerError = xhr => {
    this.logDismissCensusBannerError(xhr);
    this.hideCensusBanner();
  };

  postponeCensusBanner() {
    $.ajax({
      url: `/api/v1/users/${this.props.teacherId}/postpone_census_banner`,
      type: 'post'
    })
      .done(this.hideCensusBanner)
      .fail(this.handlePostponeCensusBannerError);
  }

  handlePostponeCensusBannerError = xhr => {
    console.error(`Failed to postpone census banner! ${xhr.responseText}`);
    this.hideCensusBanner();
  };

  componentDidMount() {
    // The component used here is implemented in legacy HAML/CSS rather than React.
    $('#teacher_reminders')
      .appendTo(ReactDOM.findDOMNode(this.refs.teacherReminders))
      .show();
    $('#flashes')
      .appendTo(ReactDOM.findDOMNode(this.refs.flashes))
      .show();

    // A special on-load behavior: If requested by queryparam, automatically
    // launch the Google Classroom rostering flow.
    const {queryStringOpen, beginGoogleImportRosterFlow} = this.props;
    if (queryStringOpen === 'rosterDialog') {
      beginGoogleImportRosterFlow();
    }
  }

  render() {
    const {
      courses,
      topCourse,
      announcement,
      joinedSections,
      ncesSchoolId,
      censusQuestion,
      schoolYear,
      teacherId,
      teacherName,
      teacherEmail,
      canViewAdvancedTools,
      isEnglish,
      specialAnnouncement
    } = this.props;

    // Show the regular announcement/notification for now.
    const showAnnouncement = true;

    // Verify background image works for both LTR and RTL languages.
    const backgroundUrl = '/shared/images/banners/teacher-homepage-hero.jpg';

    return (
      <div>
        <HeaderBanner
          headingText={i18n.homepageHeading()}
          short={true}
          backgroundUrl={backgroundUrl}
        />
        <div className={'container main'}>
          <ProtectedStatefulDiv ref="flashes" />
          <ProtectedStatefulDiv ref="teacherReminders" />
          {isEnglish && specialAnnouncement && (
            <SpecialAnnouncementActionBlock
              announcement={specialAnnouncement}
            />
          )}
          {announcement && showAnnouncement && (
            <div>
              <Notification
                type={announcement.type || 'bullhorn'}
                notice={announcement.heading}
                details={announcement.description}
                dismissible={true}
                buttonText={announcement.buttonText}
                buttonLink={announcement.link}
                newWindow={true}
                analyticId={announcement.id}
              />
              <div style={styles.clear} />
            </div>
          )}
          {isEnglish && <SpecialAnnouncement isTeacher={true} />}
          {this.state.showCensusBanner && (
            <div>
              <CensusTeacherBanner
                ref={this.bindCensusBanner}
                schoolYear={schoolYear}
                ncesSchoolId={ncesSchoolId}
                question={censusQuestion}
                teaches={this.state.censusBannerTeachesSelection}
                inClass={this.state.censusBannerInClassSelection}
                teacherId={teacherId}
                teacherName={teacherName}
                teacherEmail={teacherEmail}
                showInvalidError={this.state.showCensusInvalidError}
                showUnknownError={this.state.showCensusUnknownError}
                submittedSuccessfully={this.state.censusSubmittedSuccessfully}
                onSubmit={() => this.handleCensusBannerSubmit()}
                onDismiss={() => this.dismissAndHideCensusBanner()}
                onPostpone={() => this.postponeCensusBanner()}
                onTeachesChange={event =>
                  this.handleCensusBannerTeachesChange(event)
                }
                onInClassChange={event =>
                  this.handleCensusBannerInClassChange(event)
                }
              />
              <br />
            </div>
          )}
          {isEnglish && this.state.donorBannerName && (
            <div>
              <DonorTeacherBanner
                showPegasusLink={true}
                source="teacher_home"
              />
              <div style={styles.clear} />
            </div>
          )}
          <TeacherSections />
          <RecentCourses
            courses={courses}
            topCourse={topCourse}
            showAllCoursesLink={true}
            isTeacher={true}
          />
          <TeacherResources />
          <ProjectWidgetWithData
            canViewFullList={true}
            canViewAdvancedTools={canViewAdvancedTools}
          />
          <StudentSections initialSections={joinedSections} isTeacher={true} />
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({}),
  {beginGoogleImportRosterFlow}
)(UnconnectedTeacherHomepage);
