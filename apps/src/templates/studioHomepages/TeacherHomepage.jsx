import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import HeaderBanner from '../HeaderBanner';
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
import DonorTeacherBanner, {
  donorTeacherBannerOptionsShape
} from '@cdo/apps/templates/DonorTeacherBanner';
import experiments from '@cdo/apps/util/experiments';

const styles = {
  clear: {
    clear: 'both',
    height: 30
  }
};

export default class TeacherHomepage extends Component {
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
    locale: PropTypes.string,
    showCensusBanner: PropTypes.bool.isRequired,
    donorBannerName: PropTypes.string,
    donorTeacherBannerOptions: donorTeacherBannerOptionsShape,
    censusQuestion: PropTypes.oneOf(['how_many_10_hours', 'how_many_20_hours']),
    teacherName: PropTypes.string,
    teacherId: PropTypes.number,
    teacherEmail: PropTypes.string,
    schoolYear: PropTypes.number
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

  dismissDonorTeacherBannerWithCallbacks(onSuccess, onFailure) {
    $.ajax({
      url: `/api/v1/users/${this.props.teacherId}/dismiss_donor_teacher_banner`,
      type: 'post'
    })
      .done(onSuccess)
      .fail(onFailure);
  }

  logDismissDonorTeacherBannerError = xhr => {
    console.error(
      `Failed to dismiss donor teacher banner! ${xhr.responseText}`
    );
  };

  dismissDonorTeacherBanner() {
    this.dismissDonorTeacherBannerWithCallbacks(
      null,
      this.logDismissDonorTeacherBannerError
    );
  }

  componentDidMount() {
    // The component used here is implemented in legacy HAML/CSS rather than React.
    $('#teacher_reminders')
      .appendTo(ReactDOM.findDOMNode(this.refs.teacherReminders))
      .show();
    $('#flashes')
      .appendTo(ReactDOM.findDOMNode(this.refs.flashes))
      .show();
  }

  render() {
    const {
      hocLaunch,
      courses,
      topCourse,
      announcement,
      joinedSections,
      ncesSchoolId,
      censusQuestion,
      schoolYear,
      donorTeacherBannerOptions,
      teacherId,
      teacherName,
      teacherEmail,
      canViewAdvancedTools,
      queryStringOpen,
      isEnglish,
      locale
    } = this.props;

    // Hide the special announcement for now.
    const showSpecialAnnouncement = false;

    // Hide the regular announcement/notification for now.
    const showAnnouncement = true;

    return (
      <div>
        <HeaderBanner headingText={i18n.homepageHeading()} short={true} />
        <ProtectedStatefulDiv ref="flashes" />
        <ProtectedStatefulDiv ref="teacherReminders" />
        {isEnglish && showSpecialAnnouncement && (
          <SpecialAnnouncementActionBlock
            hocLaunch={hocLaunch}
            hasIncompleteApplication={
              !!sessionStorage['Teacher1920Application']
            }
          />
        )}
        {announcement && showAnnouncement && (
          <div>
            <Notification
              type={announcement.type || 'bullhorn'}
              notice={announcement.heading}
              details={announcement.description}
              dismissible={false}
              buttonText={announcement.buttonText}
              buttonLink={announcement.link}
              newWindow={true}
              analyticId={announcement.id}
            />
            <div style={styles.clear} />
          </div>
        )}
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
        {experiments.isEnabled('donorTeacherBanner') &&
          isEnglish &&
          this.state.donorBannerName && (
            <div>
              <DonorTeacherBanner
                options={donorTeacherBannerOptions}
                onDismiss={() => this.dismissDonorTeacherBanner()}
                showPegasusLink={true}
              />
              <div style={styles.clear} />
            </div>
          )}
        <TeacherSections queryStringOpen={queryStringOpen} locale={locale} />
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
    );
  }
}
