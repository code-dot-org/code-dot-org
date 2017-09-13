import $ from 'jquery';
import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import ContentContainer from '../ContentContainer';
import CourseBlocksTools from './CourseBlocksTools';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import Responsive from '../../responsive';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

export class CourseBlocksCsf extends Component {
  static propTypes = {
    isEnglish: PropTypes.bool.isRequired
  };

  render() {
    if (this.props.isEnglish) {
      return (<CourseBlocksCsfEnglish/>);
    } else {
      return (<CourseBlocksCsfNonEnglish/>);
    }
  }
}

export class CourseBlocksCsfEnglish extends Component {
  componentDidMount() {
    $('#coursea').appendTo(ReactDOM.findDOMNode(this.refs.coursea)).show();
    $('#courseb').appendTo(ReactDOM.findDOMNode(this.refs.courseb)).show();
    $('#coursec').appendTo(ReactDOM.findDOMNode(this.refs.coursec)).show();
    $('#coursed').appendTo(ReactDOM.findDOMNode(this.refs.coursed)).show();
    $('#coursee').appendTo(ReactDOM.findDOMNode(this.refs.coursee)).show();
    $('#coursef').appendTo(ReactDOM.findDOMNode(this.refs.coursef)).show();
    $('#pre-express').appendTo(ReactDOM.findDOMNode(this.refs.pre_express)).show();
    $('#express').appendTo(ReactDOM.findDOMNode(this.refs.express)).show();
  }

  render() {
    return (
      <div>
        <ContentContainer
          heading={i18n.courseBlocksCsfExpressHeading()}
          description={i18n.courseBlocksCsfExpressDescription()}
          isRtl={false}
        >
          <div className="row">
            <ProtectedStatefulDiv ref="pre_express"/>
            <ProtectedStatefulDiv ref="express"/>
          </div>
        </ContentContainer>

        <ContentContainer
          heading={i18n.courseBlocksCsfYoungHeading()}
          description={i18n.courseBlocksCsfYoungDescription()}
          isRtl={false}
        >
          <div className="row">
            <ProtectedStatefulDiv ref="coursea"/>
            <ProtectedStatefulDiv ref="courseb"/>
          </div>
        </ContentContainer>

        <ContentContainer
          heading={i18n.courseBlocksCsfOlderHeading()}
          description={i18n.courseBlocksCsfOlderDescription()}
          isRtl={false}
        >
          <div className="row">
            <ProtectedStatefulDiv ref="coursec"/>
            <ProtectedStatefulDiv ref="coursed"/>
            <ProtectedStatefulDiv ref="coursee"/>
            <ProtectedStatefulDiv ref="coursef"/>
          </div>
        </ContentContainer>

      </div>
    );
  }
}

export class CourseBlocksCsfNonEnglish extends Component {
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
      <div>
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
      </div>
    );
  }
}

export class CourseBlocksHoc extends Component {
  static propTypes = {
    rowCount: PropTypes.number.isRequired
  };

  componentDidMount() {
    $('#minecraft').appendTo(ReactDOM.findDOMNode(this.refs.minecraft)).show();
    $('#starwars').appendTo(ReactDOM.findDOMNode(this.refs.starwars)).show();
    $('#frozen').appendTo(ReactDOM.findDOMNode(this.refs.frozen)).show();
    $('#hourofcode').appendTo(ReactDOM.findDOMNode(this.refs.hourofcode)).show();
    $('#flappy').appendTo(ReactDOM.findDOMNode(this.refs.flappy)).show();
    $('#infinity').appendTo(ReactDOM.findDOMNode(this.refs.infinity)).show();
    $('#playlab').appendTo(ReactDOM.findDOMNode(this.refs.playlab)).show();
    $('#artist').appendTo(ReactDOM.findDOMNode(this.refs.artist)).show();
  }

  render() {
    return (
      <div>
        <div className="row">
          <ProtectedStatefulDiv ref="minecraft"/>
          <ProtectedStatefulDiv ref="starwars"/>
          <ProtectedStatefulDiv ref="frozen"/>
          <ProtectedStatefulDiv ref="hourofcode"/>
        </div>

        {this.props.rowCount > 1 && (
          <div>
            <br/>
            <br/>
            <div className="row">
              <ProtectedStatefulDiv ref="flappy"/>
              <ProtectedStatefulDiv ref="infinity"/>
              <ProtectedStatefulDiv ref="playlab"/>
              <ProtectedStatefulDiv ref="artist"/>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export class CourseBlocksAll extends Component {
  static propTypes = {
    isEnglish: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
    responsive: PropTypes.instanceOf(Responsive).isRequired
  };

  componentDidMount() {
    $('.csf-courses-header').appendTo(ReactDOM.findDOMNode(this.refs.csfCoursesHeader)).show();
  }

  render() {
    return (
      <div>
        <ContentContainer
          heading={i18n.csf()}
          description={i18n.csfDescription()}
          link={'/home/#recent-courses'}
          linkText={i18n.viewMyRecentCourses()}
          isRtl={this.props.isRtl}
          responsive={this.props.responsive}
        >
          <CourseBlocksCsf isEnglish={this.props.isEnglish}/>
        </ContentContainer>

        <ContentContainer
          heading={i18n.teacherCourseHoc()}
          description={i18n.teacherCourseHocDescription()}
          isRtl={this.props.isRtl}
          linkText={i18n.teacherCourseHocLinkText()}
          link={pegasus('/hourofcode/overview')}
          responsive={this.props.responsive}
        >
          <CourseBlocksHoc rowCount={1}/>
        </ContentContainer>

        <CourseBlocksTools
          isEnglish={this.props.isEnglish}
          isRtl={this.props.isRtl}
          responsive={this.props.responsive}
        />
      </div>
    );
  }
}
