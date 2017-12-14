import $ from 'jquery';
import _ from 'lodash';
import React, { PropTypes, Component } from 'react';
import Responsive from '../responsive';
import Certificate from './Certificate';
import StudentsBeyondHoc from './StudentsBeyondHoc';
import TeachersBeyondHoc from './TeachersBeyondHoc';

const styles = {
  container: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
};

export default class Congrats extends Component {
  static propTypes = {
    certificateId: PropTypes.string,
    tutorial: PropTypes.string,
    MCShareLink: PropTypes.string,
    isRtl: PropTypes.bool.isRequired,
    userType: PropTypes.oneOf(["signedOut", "teacher", "student"]).isRequired,
    userAge: PropTypes.number,
    isEnglish: PropTypes.bool.isRequired,
    randomDonorTwitter: PropTypes.string,
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
    const {
      tutorial,
      certificateId,
      MCShareLink,
      isRtl,
      userType,
      userAge,
      isEnglish,
      randomDonorTwitter
    } = this.props;

    const tutorialType = {
      'applab-intro': 'applab',
      hero: '2017Minecraft',
      minecraft: 'pre2017Minecraft',
      mc: 'pre2017Minecraft',
    }[tutorial] || 'other';

    const contentStyle = {
      ...styles.container,
      width: this.responsive.getResponsiveContainerWidth()
    };

    return (
        <div style={contentStyle}>
          <Certificate
            tutorial={tutorial}
            certificateId={certificateId}
            randomDonorTwitter={randomDonorTwitter}
          />
          {userType === "teacher" && isEnglish && (
            <TeachersBeyondHoc
              responsive={this.responsive}
            />
          )}
          <StudentsBeyondHoc
            completedTutorialType={tutorialType}
            MCShareLink={MCShareLink}
            responsive={this.responsive}
            isRtl={isRtl}
            userType={userType}
            userAge={userAge}
            isEnglish={isEnglish}
          />
          {userType === "signedOut" && isEnglish && (
            <TeachersBeyondHoc
              responsive={this.responsive}
            />
          )}
        </div>
    );
  }
}
