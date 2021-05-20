/* RoboticsButton: A button shown below the filters that goes to /learn/robotics.
 */

import PropTypes from 'prop-types';
import React from 'react';
import {getResponsiveValue} from './responsive';
import i18n from '@cdo/tutorialExplorer/locale';

export default class RoboticsButton extends React.Component {
  static propTypes = {
    url: PropTypes.string
  };

  render() {
    const roboticsTextStyle = {
      ...styles.roboticsText,
      display: getResponsiveValue({xs: 'block', md: 'none'})
    };

    return (
      <div>
        <div style={{display: getResponsiveValue({md: 'block', xs: 'none'})}}>
          <div style={styles.button}>
            <a href={this.props.url}>
              <div style={styles.container}>
                <img
                  src="/images/learn/robotics-link.png"
                  style={styles.roboticsButtonImage}
                  alt=""
                />
                <div style={styles.roboticsButtonText}>
                  {i18n.roboticsButtonText()}
                  &nbsp;
                  <i className="fa fa-arrow-right" aria-hidden={true} />
                </div>
              </div>
            </a>
          </div>
        </div>

        <div style={roboticsTextStyle}>
          <a href={this.props.url}>{i18n.roboticsText()}</a>
        </div>
      </div>
    );
  }
}

const styles = {
  button: {
    float: 'left',
    width: '100%',
    paddingLeft: 10,
    paddingRight: 40
  },
  container: {
    position: 'relative'
  },
  roboticsButtonImage: {
    marginTop: 10,
    marginBottom: 20,
    width: '100%'
  },
  roboticsButtonText: {
    fontFamily: "'Gotham 4r', sans-serif",
    position: 'absolute',
    top: 0,
    left: 0,
    margin: '25px 15px 15px 15px',
    color: 'white',
    textAlign: 'center',
    fontSize: 16
  },
  roboticsText: {
    float: 'left',
    margin: 5,
    padding: 5,
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: '#eee'
  }
};
