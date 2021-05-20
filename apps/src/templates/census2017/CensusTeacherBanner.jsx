import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Button from '../Button';
import SchoolInfoInputs from '../SchoolInfoInputs';
import styleConstants from '../../styleConstants';
import color from '@cdo/apps/util/color';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

export default class CensusTeacherBanner extends Component {
  static propTypes = {
    schoolYear: PropTypes.number.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired,
    onPostpone: PropTypes.func.isRequired,
    onTeachesChange: PropTypes.func.isRequired,
    onInClassChange: PropTypes.func.isRequired,
    ncesSchoolId: PropTypes.string.isRequired,
    question: PropTypes.oneOf(['how_many_10_hours', 'how_many_20_hours'])
      .isRequired,
    teaches: PropTypes.bool,
    inClass: PropTypes.bool,
    teacherId: PropTypes.number.isRequired,
    teacherName: PropTypes.string.isRequired,
    teacherEmail: PropTypes.string.isRequired,
    showInvalidError: PropTypes.bool,
    showUnknownError: PropTypes.bool,
    submittedSuccessfully: PropTypes.bool
  };

  componentDidMount() {
    this.loadSchoolName(this.props.ncesSchoolId);
  }

  initialState = {
    showSchoolInfoForm: false,
    country: 'United States',
    schoolType: '',
    ncesSchoolId: null,
    schoolName: '',
    schoolDisplayName: null,
    schoolState: '',
    schoolZip: '',
    schoolLocation: '',
    showSchoolInfoErrors: false,
    showSchoolInfoUnknownError: false
  };

  state = this.initialState;

  handleCountryChange = (_, event) => {
    const newCountry = event ? event.value : '';
    this.setState({country: newCountry});
  };

  handleSchoolTypeChange = event => {
    const newType = event ? event.target.value : '';
    this.setState({schoolType: newType});
  };

  handleSchoolChange = (_, event) => {
    const newSchool = event ? event.value : '';
    this.setState({ncesSchoolId: newSchool});
    this.loadSchoolName(newSchool);
  };

  handleSchoolNotFoundChange = (field, event) => {
    const newValue = event ? event.target.value : '';
    this.setState({
      [field]: newValue
    });
  };

  showSchoolInfoForm = () => {
    this.setState({showSchoolInfoForm: true});
  };

  hideSchoolInfoForm = () => {
    this.setState({
      showSchoolInfoForm: false,
      showSchoolInfoErrors: false
    });
  };

  dismissSchoolInfoForm = () => {
    // This is handling the case where the user dismissed the
    // "update your school" view, not the entire banner. In that case, there
    // may have been partial state about the school changed. We do not want
    // to use that partial state in the census submission so we need to reset
    // to the previous values.
    this.setState(this.initialState);
    this.loadSchoolName(this.props.ncesSchoolId);
  };

  handleSchoolInfoSubmit = () => {
    if (this.schoolInfoInputs.isValid()) {
      let schoolData;
      if (this.state.ncesSchoolId === '-1') {
        schoolData = {
          _method: 'patch',
          'user[school_info_attributes][country]': this.state.country,
          'user[school_info_attributes][school_type]': this.state.schoolType,
          'user[school_info_attributes][school_name]': this.state.schoolName,
          'user[school_info_attributes][school_state]': this.state.schoolState,
          'user[school_info_attributes][school_zip]': this.state.schoolZip,
          'user[school_info_attributes][full_address]': this.state
            .schoolLocation
        };
      } else {
        schoolData = {
          _method: 'patch',
          'user[school_info_attributes][school_id]': this.state.ncesSchoolId
        };
      }
      $.ajax({
        url: '/users.json',
        type: 'post',
        dataType: 'json',
        data: schoolData
      })
        .done(this.hideSchoolInfoForm)
        .fail(this.updateSchoolInfoError);
    } else {
      this.setState({
        showSchoolInfoErrors: true
      });
    }
  };

  updateSchoolInfoError = () => {
    // It isn't clear what could cause an error here since none of the fields are required.
    this.setState({
      showSchoolInfoUnknownError: true
    });
  };

  loadSchoolName = schoolId => {
    if (schoolId && schoolId !== '-1') {
      $.ajax({
        url: `/api/v1/schools/${schoolId}`,
        type: 'get'
      })
        .done(this.loadSchoolNameSuccess)
        .fail(this.loadSchoolNameError);
    } else {
      this.setState({
        schoolDisplayName: ''
      });
    }
  };

  loadSchoolNameSuccess = response => {
    this.setState({
      schoolDisplayName: response.name,
      schoolType: response.school_type
    });
  };

  loadSchoolNameError = error => {
    this.setState({
      schoolDisplayName: 'your school'
    });
  };

  bindSchoolInfoInputs = inputs => {
    this.schoolInfoInputs = inputs;
  };

  isValid = () => {
    return (
      !this.props.teaches ||
      (this.props.inClass === true || this.props.inClass === false)
    );
  };

  getData = () => {
    const schoolId = this.state.ncesSchoolId
      ? this.state.ncesSchoolId
      : this.props.ncesSchoolId;
    let data = {
      submitter_role: 'TEACHER',
      submitter_name: this.props.teacherName,
      submitter_email_address: this.props.teacherEmail,
      school_year: this.props.schoolYear
    };
    const question = this.props.inClass
      ? this.props.question
      : 'how_many_after_school';
    data[question] = 'SOME';

    if (schoolId === '-1') {
      data['country_s'] = this.state.country;
      data['school_type_s'] = this.state.schoolType;
      data['school_name_s'] = this.state.schoolName;
      data['school_state_s'] = this.state.schoolState;
      data['school_zip_s'] = this.state.schoolZip;
      data['school_location'] = this.state.schoolLocation;
    } else {
      data['nces_school_s'] = schoolId;
    }

    return data;
  };

  renderThankYou() {
    const yourschoolUrl = encodeURIComponent('https://code.org/yourschool');
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${yourschoolUrl}`;
    const twitterText = encodeURIComponent(
      'Does your school teach computer science? Expand computer science at your school or district. @codeorg'
    );
    const twitterShareUrl = `https://twitter.com/intent/tweet?url=${yourschoolUrl}&related=codeorg&text=${twitterText}`;

    return (
      <div>
        <div style={styles.header}>
          <h2>Thanks for adding your school to the map!</h2>
        </div>
        <div style={styles.message}>
          <p style={styles.introQuestion}>
            Help us find out about computer science opportunities at every
            school in the United States!
          </p>
        </div>
        <div style={styles.share}>
          <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer">
            <button type="button" style={styles.shareButton}>
              <i className="fa fa-facebook" /> Share on Facebook
            </button>
          </a>
          <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer">
            <button type="button" style={styles.shareButton}>
              <i className="fa fa-twitter" /> Share on Twitter
            </button>
          </a>
        </div>
      </div>
    );
  }

  renderSchoolInfoForm() {
    let schoolId =
      this.state.ncesSchoolId !== null
        ? this.state.ncesSchoolId
        : this.props.ncesSchoolId;
    return (
      <div>
        <div style={styles.header}>
          <h2>Update your school information</h2>
          {this.state.showSchoolInfoUnknownError && (
            <p style={styles.error}>
              We encountered an error with your submission. Please try again.
            </p>
          )}
        </div>
        <div style={styles.message}>
          <SchoolInfoInputs
            ref={this.bindSchoolInfoInputs}
            onCountryChange={this.handleCountryChange}
            onSchoolTypeChange={this.handleSchoolTypeChange}
            onSchoolChange={this.handleSchoolChange}
            onSchoolNotFoundChange={this.handleSchoolNotFoundChange}
            country={this.state.country}
            schoolType={this.state.schoolType}
            ncesSchoolId={schoolId}
            schoolName={this.state.schoolName}
            schoolState={this.state.schoolState}
            schoolZip={this.state.schoolZip}
            schoolLocation={this.state.schoolLocation}
            useLocationSearch={true}
            showErrors={this.state.showSchoolInfoErrors}
            showRequiredIndicator={true}
          />
        </div>
        <div style={styles.buttonDiv}>
          <Button
            __useDeprecatedTag
            onClick={this.dismissSchoolInfoForm}
            style={styles.button}
            color="gray"
            size="large"
            text="Dismiss"
          />
          <Button
            __useDeprecatedTag
            onClick={this.handleSchoolInfoSubmit}
            style={styles.button}
            size="large"
            text="Submit"
          />
        </div>
      </div>
    );
  }

  renderCensusForm() {
    const numHours = this.props.question === 'how_many_20_hours' ? '20' : '10';
    let buttons;
    let footer;
    if (this.props.teaches === true) {
      footer = <hr />;
      buttons = (
        <div style={styles.buttonDiv}>
          <Button
            __useDeprecatedTag
            onClick={this.props.onDismiss}
            style={styles.button}
            color="gray"
            size="large"
            text="No thanks"
          />
          <Button
            __useDeprecatedTag
            onClick={this.props.onSubmit}
            style={styles.button}
            size="large"
            text="Add my school to the map!"
          />
        </div>
      );
    } else if (this.props.teaches === false) {
      footer = (
        <div>
          <hr />
          <p>
            We’d love to know more about computer science opportunities at your
            school. Please take our survey to increase access to Computer
            Science in the US.
          </p>
        </div>
      );
      const schoolId = this.state.ncesSchoolId
        ? this.state.ncesSchoolId
        : this.props.ncesSchoolId;
      const link = encodeURI(
        `/yourschool?schoolId=${schoolId}&isTeacher=true&name=${
          this.props.teacherName
        }&email=${this.props.teacherEmail}#form`
      );
      buttons = (
        <div style={styles.buttonDiv}>
          <Button
            __useDeprecatedTag
            onClick={this.props.onPostpone}
            style={styles.button}
            color="gray"
            size="large"
            text="Not now"
          />
          <Button
            __useDeprecatedTag
            onClick={this.props.onPostpone}
            href={pegasus(link)}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.button}
            size="large"
            text="Take the survey"
          />
        </div>
      );
    }

    let schoolName;

    if (this.state.schoolDisplayName) {
      schoolName = this.state.schoolDisplayName;
    } else if (this.state.schoolName) {
      schoolName = this.state.schoolName;
    }

    if (schoolName) {
      return (
        <div>
          <div style={styles.header}>
            <h2 style={styles.title}>Add {schoolName} to our map!</h2>
            <p style={styles.updateSchool}>
              Not teaching at this school anymore?&ensp;
              <a
                style={styles.updateSchoolLink}
                onClick={this.showSchoolInfoForm}
              >
                Update here
              </a>
            </p>
            {this.props.showUnknownError && (
              <p style={styles.error}>
                We encountered an error with your submission. Please try again.
              </p>
            )}
          </div>
          <div style={styles.message}>
            <p style={styles.introQuestion}>
              It looks like you teach computer science. Have your students
              already done {numHours} hours of programming content this year
              (not including HTML/CSS)?
            </p>
            <label>
              <input
                type="radio"
                id="teachesYes"
                name={this.props.question}
                value="SOME"
                style={styles.radio}
                onChange={this.props.onTeachesChange}
                checked={this.props.teaches === true}
              />
              Yes, we’ve done {numHours} hours.
            </label>
            <label>
              <input
                type="radio"
                id="teachesNo"
                name={this.props.question}
                style={styles.radio}
                onChange={this.props.onTeachesChange}
                value="not yet"
                checked={this.props.teaches === false}
              />
              Not yet.
            </label>
            {this.props.teaches && this.props.showInvalidError && (
              <p style={styles.error}>
                Please select one of the options below.
              </p>
            )}
            {this.props.teaches && (
              <div>
                <p style={styles.introQuestion}>
                  Which of the following best describes where you teach
                  programming?
                </p>
                <label>
                  <input
                    type="radio"
                    id="inClass"
                    value="inclass"
                    style={styles.radio}
                    onChange={this.props.onInClassChange}
                    checked={this.props.inClass === true}
                  />
                  In a classroom
                </label>
                <label>
                  <input
                    type="radio"
                    id="afterSchool"
                    style={styles.radio}
                    onChange={this.props.onInClassChange}
                    value="afterschool"
                    checked={this.props.inClass === false}
                  />
                  In an afterschool program or club
                </label>
              </div>
            )}
            {footer}
          </div>
          {buttons}
        </div>
      );
    } else {
      // Don't display until school name has been loaded
      return null;
    }
  }

  render() {
    let mainForm;

    if (this.props.submittedSuccessfully) {
      mainForm = this.renderThankYou();
    } else if (this.state.showSchoolInfoForm) {
      mainForm = this.renderSchoolInfoForm();
    } else {
      mainForm = this.renderCensusForm();
    }

    return (
      <div style={styles.main}>
        <div style={styles.image}>
          <img
            src="/shared/images/misc/census-map-with-flag.png"
            alt="Map with flag"
            width="180"
            height="180"
          />
        </div>
        {mainForm}
        <div style={styles.clear} />
      </div>
    );
  }
}

const styles = {
  button: {
    marginLeft: 7,
    marginRight: 7,
    marginTop: 15,
    marginBottom: 15
  },
  buttonDiv: {
    textAlign: 'center'
  },
  clear: {
    clear: 'both'
  },
  error: {
    color: color.red
  },
  header: {
    marginTop: 10,
    marginBottom: 5,
    marginLeft: 20,
    marginRight: 20
  },
  image: {
    float: 'right',
    margin: 5
  },
  introQuestion: {
    marginTop: 10,
    marginBottom: 5
  },
  main: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.teal,
    minHeight: 72,
    width: styleConstants['content-width'],
    backgroundColor: color.white,
    overflowWrap: 'break-word'
  },
  message: {
    marginTop: 0,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20
  },
  radio: {
    verticalAlign: 'top',
    marginRight: 10
  },
  share: {
    textAlign: 'center'
  },
  shareButton: {
    color: color.white,
    backgroundColor: '#7E5CA2',
    minWidth: 40
  },
  title: {
    marginBottom: 0
  },
  updateSchool: {
    fontSize: '85%',
    marginTop: 0,
    marginBottom: 0
  },
  updateSchoolLink: {
    cursor: 'pointer'
  }
};
