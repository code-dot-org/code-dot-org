import $ from 'jquery';
import _ from 'lodash';
import React, { PropTypes, Component } from 'react';
import Responsive from '../responsive';
import Certificate from './Certificate';
import StudentsBeyondHoc from './StudentsBeyondHoc';
import TeachersBeyondHoc from './TeachersBeyondHoc';
import { tutorialTypes } from './tutorialTypes.js';

export default class Congrats extends Component {
  static propTypes = {
    completedTutorialType: PropTypes.oneOf(tutorialTypes).isRequired,
    MCShareLink: PropTypes.string,
    isRtl: PropTypes.bool.isRequired,
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
    const { completedTutorialType, MCShareLink, isRtl } = this.props;
    const contentStyle = {
      width: this.responsive.getResponsiveContainerWidth()
    };

    return (
      <div style={contentStyle}>
        <Certificate
          completedTutorialType={completedTutorialType}
        />
        <StudentsBeyondHoc
          completedTutorialType={completedTutorialType}
          MCShareLink={MCShareLink}
          responsive={this.responsive}
          isRtl={isRtl}
        />
        <TeachersBeyondHoc/>
      </div>
    );
  }
}
