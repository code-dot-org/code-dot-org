import React from 'react';
import PropTypes from 'prop-types';
import './professionalLearningApplyBanner.scss';

class ProfessionalLearningApplyBanner extends React.Component {
  static propTypes = {
    nominated: PropTypes.bool,
    teacherApplicationMode: PropTypes.string,
    style: PropTypes.object,
    linkSuffix: PropTypes.string,
    customText: PropTypes.string,
    buttonText: PropTypes.string
  };

  generateLink() {
    let link = '/educate/professional-learning';
    if (this.props.linkSuffix) {
      link = `${link}/${this.props.linkSuffix}`;
    }
    if (this.props.nominated) {
      return link + '?nominated=true';
    } else {
      return link;
    }
  }

  getText() {
    if (this.props.customText) {
      return this.props.customText;
    } else if (this.props.nominated) {
      return 'CONGRATULATIONS! You’ve been nominated for a scholarship!';
    } else if (this.props.teacherApplicationMode === 'closing-soon') {
      return 'Applications closing soon! 2022 Professional Learning for Middle and High School teachers';
    } else {
      return 'SEATS OPEN - 2022 Professional Learning for Middle and High School teachers';
    }
  }

  render() {
    return (
      <div>
        <div style={this.props.style}>
          <a href={this.generateLink()} id="pl-apply-banner">
            <div className="pl-apply-banner-columns">
              <div style={styles.textWrapper}>
                <div
                  className="desktop-feature"
                  style={styles.leftArrowContainer}
                >
                  <div style={styles.leftArrow} />
                </div>
                <div style={styles.textBox}>
                  <div style={styles.text}>{this.getText()}</div>
                </div>
                <div className="desktop-feature">
                  <div style={styles.planeArrow}>
                    <div>
                      <div style={styles.rightArrow} />
                    </div>
                    <div style={styles.plane}>
                      <img
                        src="/images/professional-learning/plane.png"
                        style={styles.image}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div style={styles.buttonWrapper}>
                <button type="button" style={styles.button}>
                  {this.props.buttonText || 'Apply Now'}
                </button>
              </div>
              <div className="clear" style={styles.clear} />
            </div>
          </a>
        </div>
      </div>
    );
  }
}

const styles = {
  bigBanner: {
    width: '100%',
    padding: 5,
    backgroundColor: '#ebe8f1'
  },

  textWrapper: {
    minHeight: 100,
    display: 'flex'
  },

  leftArrowContainer: {
    backgroundColor: '#7665a0'
  },

  leftArrow: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: '50px 0 50px 25px',
    borderColor: 'transparent transparent transparent #ebe8f1'
  },

  textBox: {
    padding: '0 20px',
    background: '#7665a0'
  },

  text: {
    color: 'white',
    fontSize: 18,
    padding: '20px 10px',
    textAlign: 'center',
    lineHeight: 1.5
  },

  buttonWrapper: {
    color: 'white',
    height: 100,
    fontSize: 18,
    textAlign: 'center',
    padding: '0 60px'
  },

  planeArrow: {
    display: 'flex'
  },

  rightArrow: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: '50px 0 50px 25px',
    borderColor: 'transparent transparent transparent #7665a0'
  },

  plane: {
    margin: 'auto'
  },

  button: {
    marginTop: 29,
    padding: '10px 40px 10px 40px',
    height: 'initial',
    fontSize: 18
  },

  image: {
    width: 100
  },

  clear: {
    clear: 'both'
  }
};

export default ProfessionalLearningApplyBanner;
