import $ from 'jquery';
import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import Responsive from '../../responsive';
import {UnconnectedCensusForm as CensusForm} from './CensusForm';
import YourSchoolResources from './YourSchoolResources';
import Notification, { NotificationType } from '../Notification';
import MobileNotification from '../MobileNotification';
import i18n from "@cdo/locale";
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import _ from 'lodash';

const styles = {
  heading: {
    marginTop: 20,
    marginBottom: 0
  },
  description: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 14,
    fontFamily: '"Gotham 4r", sans-serif',
    lineHeight: '1.5em'
  },
  mapFooter: {
    fontFamily: '"Gotham 7r", sans-serif',
    fontSize: 20,
    marginLeft: 25,
    marginRight: 25
  }
};

export default class YourSchool extends Component {
  static propTypes = {
    alertHeading: PropTypes.string,
    alertText: PropTypes.string,
    alertUrl: PropTypes.string,
    hideMap: PropTypes.bool
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
    if (!this.props.hideMap) {
      $('#map').appendTo(ReactDOM.findDOMNode(this.refs.map)).show();
    }
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
    const desktop = (this.responsive.isResponsiveCategoryActive('lg') || this.responsive.isResponsiveCategoryActive('md'));

    return (
      <div>
        {this.props.alertHeading && this.props.alertText && this.props.alertUrl && desktop && (
          <Notification
            type={NotificationType.bullhorn}
            notice={this.props.alertHeading}
            details={this.props.alertText}
            buttonText={i18n.learnMore()}
            buttonLink={this.props.alertUrl}
            dismissible={false}
            newWindow={true}
            width="100%"
          />
        )}
        {this.props.alertHeading && this.props.alertText && this.props.alertUrl && !desktop && (
          <MobileNotification
            notice={this.props.alertHeading}
            details={this.props.alertText}
            buttonText={i18n.learnMore()}
            buttonLink={this.props.alertUrl}
            newWindow={true}
          />
        )}
        <h1 style={styles.heading}>
          {i18n.yourSchoolHeading()}
        </h1>
        <h3 style={styles.description}>
          {i18n.yourSchoolDescription()}
        </h3>
        <YourSchoolResources/>
        <h1 style={styles.heading}>
          Put your school on the map
        </h1>
        <h3 style={styles.description}>
          {i18n.yourSchoolMapDesc()}
          If you are located in the US, please <a href="#form">fill out the form below</a>.
          If you are outside the US, <a href="/learn/local">add your school here</a>.
        </h3>
        <ProtectedStatefulDiv ref="map"/>
        <CensusForm/>
      </div>
    );
  }
}
