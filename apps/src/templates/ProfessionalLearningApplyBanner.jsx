import React from 'react';
import PropTypes from 'prop-types';

class ProfessionalLearningApplyBanner extends React.Component {
  static propTypes = {
    useSignUpText: PropTypes.bool,
    nominated: PropTypes.bool,
    teacherApplicationMode: PropTypes.string,
    style: PropTypes.object,
    linkSuffix: PropTypes.string
  };

  styles = {
    bigBanner: {
      width: '100%',
      padding: 5,
      backgroundColor: '#ebe8f1'
    },

    textWrapper: {
      backgroundColor: '#7665a0',
      minHeight: 100
    },

    leftArrowContainer: {
      float: 'left',
      width: '7%'
    },

    leftArrow: {
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderWidth: '50px 0 50px 25px',
      borderColor: 'transparent transparent transparent #ebe8f1'
    },

    textContainer: {
      float: 'left',
      width: '93%'
    },

    text: {
      color: 'white',
      fontSize: 16,
      padding: '25px 10px',
      textAlign: 'center',
      lineHeight: 1.5
    },

    text18Font: {
      color: 'white',
      fontSize: 18,
      padding: '20px 10px',
      textAlign: 'center',
      lineHeight: 1.5
    },

    imageButtonWrapper: {
      backgroundColor: '#ebe8f1',
      color: 'white',
      height: 100,
      fontSize: 18,
      textAlign: 'center'
    },

    desktopFeature: {
      float: 'left',
      width: '30%'
    },

    rightArrowContainer: {
      float: 'left'
    },

    rightArrow: {
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderWidth: '50px 0 50px 25px',
      borderColor: 'transparent transparent transparent #7665a0'
    },

    plane: {
      float: 'left',
      paddingTop: 14
    },

    button: {
      marginTop: 29,
      padding: '10px 40px 10px 40px',
      height: 'initial',
      marginRight: 30,
      fontSize: 18
    },

    image: {
      width: 100
    },

    desktopBtnContainer: {
      float: 'left',
      width: '70%'
    },

    mobileBtnContainer: {
      float: 'left',
      width: '100%'
    },

    clear: {
      clear: 'both'
    }
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
    if (this.props.useSignUpText) {
      return 'Professional Learning is still on! Applications are open for Middle and High School teachers!';
    } else if (this.props.nominated) {
      return 'CONGRATULATIONS! You’ve been nominated for a scholarship!';
    } else if (this.props.teacherApplicationMode === 'closing-soon') {
      return 'Applications closing soon! 2021 Professional Learning for Middle and High School teachers';
    } else {
      return 'SEATS OPEN - 2021 Professional Learning for Middle and High School teachers';
    }
  }

  render() {
    return (
      <div style={this.props.style}>
        <a href={this.generateLink()} id="pl-apply-banner">
          <div style={this.styles.bigBanner}>
            <div className="col-50" style={this.styles.textWrapper}>
              <div
                className="desktop-feature"
                style={this.styles.leftArrowContainer}
              >
                <div style={this.styles.leftArrow} />
              </div>
              <div style={this.styles.textContainer}>
                <div
                  style={
                    this.props.useSignUpText
                      ? this.styles.text
                      : this.styles.text18Font
                  }
                >
                  {this.getText()}
                </div>
              </div>
            </div>
            <div className="col-50" style={this.styles.imageButtonWrapper}>
              <div
                className="desktop-feature"
                style={this.styles.desktopFeature}
              >
                <div style={this.styles.rightArrowContainer}>
                  <div style={this.styles.rightArrow} />
                </div>
                <div style={this.styles.plane}>
                  <img
                    src="/images/professional-learning/plane.png"
                    style={this.styles.image}
                  />
                </div>
              </div>
              <div
                className="desktop-feature"
                style={this.styles.desktopBtnContainer}
              >
                <div>
                  <button type="button" style={this.styles.button}>
                    Apply Now
                  </button>
                </div>
              </div>
              <div
                className="mobile-feature"
                style={this.styles.mobileBtnContainer}
              >
                <div>
                  <button type="button" style={this.styles.button}>
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
            <div className="clear" style={this.styles.clear} />
          </div>
        </a>
      </div>
    );
  }
}

export default ProfessionalLearningApplyBanner;
