import $ from 'jquery';
import _ from 'lodash';
import React, { PropTypes, Component } from 'react';
import Responsive from '../responsive';
import Certificate from './Certificate';
import StudentsBeyondHoc from './StudentsBeyondHoc';
import TeachersBeyondHoc from './TeachersBeyondHoc';
import { tutorialTypes } from './tutorialTypes.js';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import responsiveRedux from '../code-studio/responsiveRedux';

const styles = {
  container: {
    marginLeft: 'auto',
    marginRight: 'auto',
  },
};

export default class Congrats extends Component {
  static propTypes = {
    completedTutorialType: PropTypes.oneOf(tutorialTypes).isRequired,
    MCShareLink: PropTypes.string,
    isRtl: PropTypes.bool.isRequired,
    userType: PropTypes.oneOf(["signedOut", "teacher", "student"]).isRequired,
    isEnglish: PropTypes.bool.isRequired,
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
    const { completedTutorialType, MCShareLink, isRtl, userType, isEnglish } = this.props;

    const isMinecraft = /2017Minecraft|pre2017Minecraft/.test(completedTutorialType);

    const contentStyle = {
      ...styles.container,
      width: this.responsive.getResponsiveContainerWidth()
    };
    const store = createStore(combineReducers({responsive: responsiveRedux}));

    return (
      <Provider store={store}>
        <div style={contentStyle}>
          <Certificate
            type={isMinecraft ? "minecraft" : "hourOfCode"}
            isRtl={isRtl}
          />
          {userType === "teacher" && isEnglish && (
            <TeachersBeyondHoc
              responsive={this.responsive}
              isRtl={isRtl}
            />
          )}
          <StudentsBeyondHoc
            completedTutorialType={completedTutorialType}
            MCShareLink={MCShareLink}
            responsive={this.responsive}
            isRtl={isRtl}
            userType={userType}
            isEnglish={isEnglish}
          />
          {userType === "signedOut" && isEnglish && (
            <TeachersBeyondHoc
              responsive={this.responsive}
              isRtl={isRtl}
            />
          )}
        </div>
      </Provider>
    );
  }
}
