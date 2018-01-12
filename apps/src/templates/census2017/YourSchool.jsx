import $ from 'jquery';
import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import {UnconnectedCensusForm as CensusForm} from './CensusForm';
import YourSchoolResources from './YourSchoolResources';
import Notification, { NotificationType } from '../Notification';
import MobileNotification from '../MobileNotification';
import i18n from "@cdo/locale";
import ProtectedStatefulDiv from '../ProtectedStatefulDiv';
import { ResponsiveSize } from '@cdo/apps/code-studio/responsiveRedux';

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

class YourSchool extends Component {
  static propTypes = {
    responsiveSize: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']).isRequired,
    alertHeading: PropTypes.string,
    alertText: PropTypes.string,
    alertUrl: PropTypes.string,
    hideMap: PropTypes.bool
  };

  componentDidMount() {
    if (!this.props.hideMap) {
      $('#map').appendTo(ReactDOM.findDOMNode(this.refs.map)).show();
    }
  }

  render() {
    const {responsiveSize} = this.props;
    const desktop = (responsiveSize === ResponsiveSize.lg) || (responsiveSize === ResponsiveSize.md);

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
        {!this.props.hideMap && (
           <div>
             <h1 style={styles.heading}>
               Put your school on the map
             </h1>
             <h3 style={styles.description}>
               {i18n.yourSchoolMapDesc()}
               If you are located in the US, please <a href="#form">fill out the form below</a>.
               If you are outside the US, <a href="/learn/local">add your school here</a>.
             </h3>
             <ProtectedStatefulDiv ref="map"/>
           </div>
        )}
        <CensusForm/>
      </div>
    );
  }
}

export default connect(state => ({
  responsiveSize: state.responsive.responsiveSize,
}))(YourSchool);
