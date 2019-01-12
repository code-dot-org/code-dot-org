import $ from 'jquery';
import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import ContentContainer from '../ContentContainer';
import CourseBlocksTools from './CourseBlocksTools';
import CourseBlocksInternationalGradeBands from './CourseBlocksInternationalGradeBands';
import {NotificationResponsive} from '@cdo/apps/templates/Notification';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

export class CourseBlocksCsf extends Component {
  static propTypes = {
    showModern: PropTypes.bool.isRequired
  };

  render() {
    if (this.props.showModern) {
      return (<CourseBlocksCsfModern/>);
    } else {
      return (<CourseBlocksCsfLegacy/>);
    }
  }
}

class CourseBlocksCsfModern extends Component {
  componentDidMount() {
    $('#coursea-2017').appendTo(ReactDOM.findDOMNode(this.refs.coursea)).show();
    $('#courseb-2017').appendTo(ReactDOM.findDOMNode(this.refs.courseb)).show();
    $('#coursec-2017').appendTo(ReactDOM.findDOMNode(this.refs.coursec)).show();
    $('#coursed-2017').appendTo(ReactDOM.findDOMNode(this.refs.coursed)).show();
    $('#coursee-2017').appendTo(ReactDOM.findDOMNode(this.refs.coursee)).show();
    $('#coursef-2017').appendTo(ReactDOM.findDOMNode(this.refs.coursef)).show();
    $('#pre-express-2017').appendTo(ReactDOM.findDOMNode(this.refs.pre_express)).show();
    $('#express-2017').appendTo(ReactDOM.findDOMNode(this.refs.express)).show();
  }

  render() {
    return (
      <div>
        <ContentContainer
          heading={i18n.courseBlocksCsfExpressHeading()}
          description={i18n.courseBlocksCsfExpressDescription()}
        >
          <div className="row">
            <ProtectedStatefulDiv ref="pre_express"/>
            <ProtectedStatefulDiv ref="express"/>
          </div>
        </ContentContainer>

        <ContentContainer
          heading={i18n.courseBlocksCsfYoungHeading()}
          description={i18n.courseBlocksCsfYoungDescription()}
        >
          <div className="row">
            <ProtectedStatefulDiv ref="coursea"/>
            <ProtectedStatefulDiv ref="courseb"/>
          </div>
        </ContentContainer>

        <ContentContainer
          heading={i18n.courseBlocksCsfOlderHeading()}
          description={i18n.courseBlocksCsfOlderDescription()}
        >
          <div className="row">
            <ProtectedStatefulDiv ref="coursec"/>
            <ProtectedStatefulDiv ref="coursed"/>
            <ProtectedStatefulDiv ref="coursee"/>
            <ProtectedStatefulDiv ref="coursef"/>
          </div>
        </ContentContainer>

        <NotificationResponsive
          type="bullhorn"
          notice={i18n.courseBlocksLegacyNotificationHeading()}
          details={i18n.courseBlocksLegacyNotificationBody()}
          detailsLinkText={i18n.courseBlocksLegacyNotificationDetailsLinkText()}
          detailsLink="https://docs.google.com/document/d/1MVDfbEzr0o9DqaOYmOOYpsQPTfXUFvCx4Xs9uixrdBE/edit?usp=sharing"
          detailsLinkNewWindow={true}
          dismissible={false}
          buttons={[
            {
              text: i18n.courseBlocksLegacyNotificationButtonCourses14(),
              link: pegasus("/educate/curriculum/cs-fundamentals-international"),
              newWindow: true,
            },
            {
              text: i18n.courseBlocksLegacyNotificationButtonCoursesAccelerated(),
              link: "/s/20-hour",
              newWindow: true,
            }
          ]}
        />
      </div>
    );
  }
}

class CourseBlocksCsfLegacy extends Component {
  componentDidMount() {
    $('#course1').appendTo(ReactDOM.findDOMNode(this.refs.course1)).show();
    $('#course2').appendTo(ReactDOM.findDOMNode(this.refs.course2)).show();
    $('#course3').appendTo(ReactDOM.findDOMNode(this.refs.course3)).show();
    $('#course4').appendTo(ReactDOM.findDOMNode(this.refs.course4)).show();
    $('#twenty_hour').appendTo(ReactDOM.findDOMNode(this.refs.twenty_hour)).show();
    $('#unplugged').appendTo(ReactDOM.findDOMNode(this.refs.unplugged)).show();
  }

  render() {
    return (
      <ContentContainer
        heading={i18n.csf()}
        description={i18n.csfDescription()}
        link={'/home/#recent-courses'}
        linkText={i18n.viewMyRecentCourses()}
      >
        <div className="row">
          <ProtectedStatefulDiv ref="course1"/>
          <ProtectedStatefulDiv ref="course2"/>
          <ProtectedStatefulDiv ref="course3"/>
          <ProtectedStatefulDiv ref="course4"/>
        </div>
        <br/>
        <br/>
        <div className="row">
          <ProtectedStatefulDiv ref="twenty_hour"/>
          <ProtectedStatefulDiv ref="unplugged"/>
        </div>
      </ContentContainer>
    );
  }
}

export class CourseBlocksHoc extends Component {
  static propTypes = {
    isInternational: PropTypes.bool,
  };

  componentDidMount() {
    const tiles = this.props.isInternational
      ? ['#dance', '#aquatic', '#frozen', '#hourofcode']
      : ['#dance', '#aquatic', '#applab-intro', '#flappy'];

    tiles.forEach((tile, index) => {
      $(tile).appendTo(ReactDOM.findDOMNode(this.refs[index]));
    });
  }

  render() {
    return (
      <div className="row">
        <ProtectedStatefulDiv ref="0"/>
        <ProtectedStatefulDiv ref="1"/>
        <ProtectedStatefulDiv ref="2"/>
        <ProtectedStatefulDiv ref="3"/>
      </div>
    );
  }
}

export class CourseBlocksAll extends Component {
  static propTypes = {
    isEnglish: PropTypes.bool.isRequired,
    showModernElementaryCourses: PropTypes.bool.isRequired,
  };

  componentDidMount() {
    $('.csf-courses-header').appendTo(ReactDOM.findDOMNode(this.refs.csfCoursesHeader)).show();
  }

  render() {
    return (
      <div>
        <CourseBlocksCsf showModern={this.props.showModernElementaryCourses}/>

        <ContentContainer
          heading={i18n.teacherCourseHoc()}
          description={i18n.teacherCourseHocDescription()}
          linkText={i18n.teacherCourseHocLinkText()}
          link={pegasus('/hourofcode/overview')}
        >
          <CourseBlocksHoc isInternational={!this.props.isEnglish}/>
        </ContentContainer>

        {!this.props.isEnglish && (
          <CourseBlocksInternationalGradeBands/>
        )}

        <CourseBlocksTools
          isEnglish={this.props.isEnglish}
        />
      </div>
    );
  }
}
