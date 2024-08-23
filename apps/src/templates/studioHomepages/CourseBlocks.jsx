import $ from 'jquery';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import {marketing} from '@cdo/apps/lib/util/urlHelpers';
import {NotificationResponsive} from '@cdo/apps/sharedComponents/Notification';
import {
  InternationalGradeBandCards,
  ToolsCards,
  ToolsWidgetsCard,
} from '@cdo/apps/util/courseBlockCardsConstants';
import i18n from '@cdo/locale';

import ContentContainer from '../ContentContainer';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';

import CourseBlocksWrapper from './CourseBlocksWrapper';
import MarketingAnnouncementBanner from './MarketingAnnouncementBanner';
import shapes from './shapes';

class ModernCsfCourses extends Component {
  componentDidMount() {
    $('#pre-express')
      .appendTo(ReactDOM.findDOMNode(this.refs.pre_express))
      .show();
    $('#express').appendTo(ReactDOM.findDOMNode(this.refs.express)).show();
    $('#unplugged').appendTo(ReactDOM.findDOMNode(this.refs.unplugged)).show();
  }

  render() {
    return (
      <ContentContainer
        heading={i18n.courseBlocksCsfExpressHeading()}
        description={i18n.courseBlocksCsfExpressDescription()}
      >
        <div className="tutorial-row">
          <ProtectedStatefulDiv
            className="tutorial-block-wide"
            ref="pre_express"
          />
          <ProtectedStatefulDiv className="tutorial-block-wide" ref="express" />
        </div>
        <div className="tutorial-row">
          <ProtectedStatefulDiv
            className="tutorial-block-wide"
            ref="unplugged"
          />
        </div>
      </ContentContainer>
    );
  }
}

class CoursesAToF extends Component {
  render() {
    return (
      <div>
        <ContentContainer
          heading={i18n.courseBlocksCsfYoungHeading()}
          description={i18n.courseBlocksCsfYoungDescription()}
        >
          <CourseBlocks tiles={['#coursea', '#courseb']} />
        </ContentContainer>

        <ContentContainer
          heading={i18n.courseBlocksCsfOlderHeading()}
          description={i18n.courseBlocksCsfOlderDescription()}
        >
          <CourseBlocks
            tiles={['#coursec', '#coursed', '#coursee', '#coursef']}
          />
        </ContentContainer>
      </div>
    );
  }
}

const LegacyCSFNotification = () => (
  <NotificationResponsive
    type="bullhorn_yellow"
    notice={i18n.courseBlocksLegacyNotificationSupportEndedHeading()}
    details={i18n.courseBlocksLegacyNotificationSupportEndedBody()}
    detailsLinkText={i18n.courseBlocksLegacyNotificationDetailsLinkText()}
    detailsLink={marketing('/educate/curriculum/csf-transition-guide')}
    detailsLinkNewWindow={true}
    dismissible={false}
    buttons={[
      {
        text: i18n.courseBlocksLegacyNotificationButtonCourses14(),
        link: marketing('/educate/curriculum/elementary-school'),
        newWindow: true,
      },
      {
        text: i18n.courseBlocksLegacyNotificationButtonCoursesAccelerated(),
        link: '/s/20-hour',
        newWindow: true,
      },
    ]}
  />
);

class Courses1To4 extends Component {
  render() {
    return (
      <ContentContainer
        heading={i18n.csf()}
        description={i18n.csfDescription()}
        link={'/home/#recent-courses'}
        linkText={i18n.viewMyRecentCourses()}
      >
        <CourseBlocks
          tiles={['#course1', '#course2', '#course3', '#course4']}
        />
      </ContentContainer>
    );
  }
}

class AcceleratedAndUnplugged extends Component {
  componentDidMount() {
    $('#20-hour').appendTo(ReactDOM.findDOMNode(this.refs.twenty_hour)).show();
    $('#unplugged').appendTo(ReactDOM.findDOMNode(this.refs.unplugged)).show();
  }

  render() {
    return (
      <div className="tutorial-row">
        <ProtectedStatefulDiv
          className="tutorial-block-wide"
          ref="twenty_hour"
        />
        <ProtectedStatefulDiv className="tutorial-block-wide" ref="unplugged" />
      </div>
    );
  }
}

const ViewMoreTile = () => (
  <div className="tutorial-block">
    <div className="courseblock-span3 courseblock-tall">
      <a href={marketing('/hourofcode/overview')}>
        <img
          src="/shared/images/more_arrow.png"
          width="100%"
          height="120px"
          alt={i18n.teacherCourseHocLinkText()}
        />
        <div className="course-container">
          <h3 className="heading">{i18n.viewMore()}</h3>
          <div className="text smalltext">
            {i18n.teacherCourseHocLinkText()}
          </div>
        </div>
      </a>
    </div>
  </div>
);

export class CourseBlocks extends Component {
  static propTypes = {
    // Array of jQuery selectors to course blocks.
    tiles: PropTypes.arrayOf(PropTypes.string).isRequired,
    showViewMoreTile: PropTypes.bool,
  };

  render() {
    return (
      <div className="tutorial-row">
        {this.props.tiles.map((tile, index) => (
          <ProtectedStatefulDiv
            className="tutorial-block"
            key={tile}
            ref={el => {
              if (el) {
                $(tile).appendTo(ReactDOM.findDOMNode(el));
              }
            }}
          />
        ))}

        {this.props.showViewMoreTile && <ViewMoreTile />}
      </div>
    );
  }
}

export class CourseBlocksHoc extends Component {
  static propTypes = {
    isInternational: PropTypes.bool,
  };

  tiles() {
    return this.props.isInternational
      ? ['#dance-2019', '#aquatic', '#frozen']
      : ['#dance-2019', '#aquatic', '#oceans'];
  }

  render() {
    return (
      <ContentContainer
        heading={i18n.teacherCourseHoc()}
        description={i18n.teacherCourseHocDescription()}
        linkText={i18n.teacherCourseHocLinkText()}
        link={marketing('/hourofcode/overview')}
      >
        <CourseBlocks tiles={this.tiles()} showViewMoreTile />
      </ContentContainer>
    );
  }
}

export class CourseBlocksIntl extends Component {
  static propTypes = {
    isTeacher: PropTypes.bool,
    showModernElementaryCourses: PropTypes.bool.isRequired,
    specialAnnouncement: shapes.specialAnnouncement,
  };

  componentDidMount() {
    $('.csf-courses-header')
      .appendTo(ReactDOM.findDOMNode(this.refs.csfCoursesHeader))
      .show();
  }

  render() {
    const {showModernElementaryCourses: modernCsf, specialAnnouncement} =
      this.props;
    const AcceleratedCourses = () => (
      <ContentContainer>
        <AcceleratedAndUnplugged />
      </ContentContainer>
    );
    return (
      <div>
        {modernCsf ? <ModernCsfCourses /> : <AcceleratedCourses />}

        <CourseBlocksHoc isInternational />

        {specialAnnouncement && (
          <MarketingAnnouncementBanner
            announcement={specialAnnouncement}
            marginBottom="30px"
          />
        )}

        {modernCsf ? <CoursesAToF /> : <Courses1To4 />}

        {modernCsf && <LegacyCSFNotification />}

        <CourseBlocksWrapper
          heading={i18n.courseBlocksInternationalGradeBandsContainerHeading()}
          description={i18n.courseBlocksInternationalGradeBandsContainerDescription()}
          cards={InternationalGradeBandCards}
        />

        <div id="uitest-course-blocks-tools">
          <CourseBlocksWrapper
            heading={i18n.courseBlocksToolsTitleNonEn()}
            description={i18n.standaloneToolsDescription()}
            cards={ToolsCards.concat(ToolsWidgetsCard)}
          />
        </div>
      </div>
    );
  }
}
