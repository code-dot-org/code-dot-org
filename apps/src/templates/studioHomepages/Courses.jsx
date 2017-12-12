import $ from 'jquery';
import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import HeaderBanner from '../HeaderBanner';
import { CourseBlocksAll } from './CourseBlocks';
import CoursesTeacherEnglish from './CoursesTeacherEnglish';
import CoursesStudentEnglish from './CoursesStudentEnglish';
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import Responsive from '../../responsive';
import _ from 'lodash';
import Button from '@cdo/apps/templates/Button';
import i18n from "@cdo/locale";

const styles = {
  content: {
    marginLeft: 'auto',
    marginRight: 'auto'
  }
};

class Courses extends Component {
  static propTypes = {
    isEnglish: PropTypes.bool.isRequired,
    isTeacher: PropTypes.bool.isRequired,
    isSignedOut: PropTypes.bool.isRequired,
    linesCount: PropTypes.string.isRequired,
    studentsCount: PropTypes.string.isRequired,
    showInitialTips: PropTypes.bool.isRequired,
    userId: PropTypes.number,
    isRtl: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    this.responsive = new Responsive();
    this.state = {
      windowWidth: $(window).width(),
      windowHeight: $(window).height(),
      mobileLayout: this.responsive.isResponsiveCategoryInactive('md')
    };
  }

  componentDidMount() {
    // The components used here are implemented in legacy HAML/CSS rather than React.
    $('#flashes').appendTo(ReactDOM.findDOMNode(this.refs.flashes)).show();

    // Resize handler.
    window.addEventListener('resize', _.debounce(this.onResize, 100).bind(this));
  }

  onResize() {
    const windowWidth = $(window).width();
    const windowHeight = $(window).height();

    // We fire window resize events when the grippy is dragged so that non-React
    // controlled components are able to rerender the editor. If width/height
    // didn't change, we don't need to do anything else here
    if (windowWidth === this.state.windowWidth &&
        windowHeight === this.state.windowHeight) {
      return;
    }

    this.setState({
      windowWidth: $(window).width(),
      windowHeight: $(window).height()
    });

    this.setState({mobileLayout: this.responsive.isResponsiveCategoryInactive('md')});
  }

  render() {
    const { isEnglish, isTeacher, isSignedOut, userId, showInitialTips, isRtl } = this.props;
    const contentStyle = {
      ...styles.content,
      width: this.responsive.getResponsiveContainerWidth()
    };
    const headingText = isTeacher ? i18n.coursesHeadingTeacher() : i18n.coursesHeadingStudent();
    const subHeadingText = i18n.coursesHeadingSubText(
      {linesCount: this.props.linesCount, studentsCount: this.props.studentsCount}
    );
    const headingDescription = isSignedOut ? i18n.coursesHeadingDescription() : null;

    return (
      <div style={contentStyle}>
        <HeaderBanner
          headingText={headingText}
          subHeadingText={subHeadingText}
          description={headingDescription}
          short={!isSignedOut}
        >
          {isSignedOut && (
            <Button
              href= "/users/sign_up"
              color={Button.ButtonColor.gray}
              text={i18n.createAccount()}
            />
          )}
        </HeaderBanner>

        <ProtectedStatefulDiv
          ref="flashes"
        />

        {/* English, teacher.  (Also can be shown when signed out.) */}
        {(isEnglish && isTeacher) && (
          <CoursesTeacherEnglish
            isSignedOut={isSignedOut}
            showInitialTips={showInitialTips}
            userId={userId}
            isRtl={isRtl}
            responsive={this.responsive}
          />
        )}

        {/* English, student.  (Also the default to be shown when signed out.) */}
        {(isEnglish && !isTeacher) && (
          <CoursesStudentEnglish
            isRtl={isRtl}
            responsive={this.responsive}
          />
        )}

        {/* Non-English */}
        {(!isEnglish) && (
          <CourseBlocksAll
            isEnglish={false}
            isRtl={isRtl}
            responsive={this.responsive}
          />
        )}
      </div>
    );
  }
}

export default Courses;
