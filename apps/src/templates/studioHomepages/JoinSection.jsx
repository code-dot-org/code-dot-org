import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import styleConstants from '../../styleConstants';
import Button from '@cdo/apps/templates/Button';
import ReCaptchaDialog from '@cdo/apps/templates/ReCaptchaDialog';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';

const styles = {
  main: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border_gray,
    width: styleConstants['content-width'],
    backgroundColor: color.white,
    marginTop: 25
  },
  mainDashed: {
    borderWidth: 5,
    borderStyle: 'dashed',
    borderColor: color.border_gray,
    boxSizing: 'border-box'
  },
  heading: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: color.white,
    color: color.teal
  },
  details: {
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 14,
    marginTop: 5,
    color: color.charcoal
  },
  wordBox: {
    width: styleConstants['content-width'] - 475,
    marginLeft: 25,
    marginTop: 25,
    marginBottom: 25,
    float: 'left',
    borderWidth: 1,
    borderColor: 'red'
  },
  actionBox: {
    float: 'right'
  },
  inputBox: {
    float: 'left',
    marginTop: 27,
    borderRadius: 0,
    height: 26,
    paddingLeft: 25,
    width: 200
  },
  button: {
    float: 'right',
    marginTop: 28,
    marginLeft: 20,
    marginRight: 25
  },
  clear: {
    clear: 'both'
  },
  spinner: {
    marginTop: '10px'
  }
};

const INITIAL_STATE = {
  sectionCode: '',
  isLoaded: false,
  displayCaptcha: false
};

export default class JoinSection extends React.Component {
  static propTypes = {
    enrolledInASection: PropTypes.bool.isRequired,
    updateSections: PropTypes.func.isRequired,
    updateSectionsResult: PropTypes.func.isRequired
  };

  state = {...INITIAL_STATE};

  fetchCaptchaInfo = () => {
    $.get({
      url: '/api/v1/sections/require_captcha',
      dataType: 'json'
    }).done(data => {
      const {key, requireCaptcha} = data;
      this.setState({key, requireCaptcha, isLoaded: true});
    });
  };

  componentDidMount() {
    this.fetchCaptchaInfo();
  }

  handleChange = event => this.setState({sectionCode: event.target.value});

  handleKeyUp = event => {
    if (event.key === 'Enter') {
      this.validateRecaptcha();
    } else if (event.key === 'Escape') {
      this.setState(INITIAL_STATE);
    }
  };

  validateRecaptcha = () => {
    const {requireCaptcha} = this.state;
    if (requireCaptcha) {
      this.setState({displayCaptcha: true});
    } else {
      this.joinSection();
    }
  };

  close = () => this.setState({displayCaptcha: false});

  //reCaptcha token will be undefined is the user isn't required to complete a captcha
  //captcha is only required for users that attempt to join 3 or more sections in 24 hours
  joinSection = recaptchaToken => {
    const sectionCode = this.state.sectionCode;
    const normalizedSectionCode = sectionCode.trim().toUpperCase();

    //Reset the form after a request is made and close captcha dialog if necessary
    this.setState({sectionCode: '', displayCaptcha: false});

    $.ajax({
      url: `/api/v1/sections/${normalizedSectionCode}/join`,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({recaptchaToken}),
      dataType: 'json'
    })
      .done(data => {
        const sectionName = data.sections.find(
          s => s.code === normalizedSectionCode
        ).name;
        this.props.updateSections(data.sections);
        this.props.updateSectionsResult(
          'join',
          data.result,
          sectionName,
          sectionCode
        );
      })
      .fail(data => {
        const result =
          data.responseJSON && data.responseJSON.result
            ? data.responseJSON.result
            : 'fail';
        this.props.updateSectionsResult(
          'join',
          result,
          null,
          normalizedSectionCode
        );
      });
  };

  render() {
    const {enrolledInASection} = this.props;
    const {isLoaded, requireCaptcha} = this.state;

    if (!isLoaded) {
      return <Spinner size="large" style={styles.spinner} />;
    }
    return (
      <div
        style={{
          ...styles.main,
          ...(enrolledInASection ? styles.main : styles.mainDashed)
        }}
      >
        <div style={styles.wordBox}>
          <div style={styles.heading}>{i18n.joinASection()}</div>
          <div style={styles.details}>{i18n.joinSectionDescription()}</div>
        </div>
        <div style={styles.actionBox}>
          <input
            type="text"
            name="sectionCode"
            value={this.state.sectionCode}
            onChange={this.handleChange}
            onKeyUp={this.handleKeyUp}
            style={styles.inputBox}
            placeholder={i18n.joinSectionPlaceholder()}
          />
          <Button
            __useDeprecatedTag
            onClick={this.validateRecaptcha}
            color={Button.ButtonColor.gray}
            disabled={this.state.sectionCode.length === 0}
            text={i18n.joinSection()}
            style={styles.button}
          />
        </div>
        <div>
          {isLoaded && requireCaptcha && (
            <ReCaptchaDialog
              isOpen={this.state.displayCaptcha}
              handleSubmit={this.joinSection}
              handleCancel={this.close}
              submitText={i18n.joinSection()}
              siteKey={this.state.key}
            />
          )}
        </div>
        <div style={styles.clear} />
      </div>
    );
  }
}
