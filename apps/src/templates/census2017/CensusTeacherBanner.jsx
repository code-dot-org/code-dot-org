import React, {Component, PropTypes} from 'react';
import Button from '../Button';
import SchoolInfoInputs from '../SchoolInfoInputs';
import styleConstants from '../../styleConstants';
import color from "@cdo/apps/util/color";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

const styles = {
  button: {
    marginLeft: 7,
    marginRight: 7,
    marginTop: 15,
    marginBottom: 15,
  },
  buttonDiv: {
    textAlign: 'center'
  },
  error: {
    color: color.red,
  },
  header: {
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
  },
  introQuestion: {
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
    marginRight: 20,
  },
  radio: {
    verticalAlign: 'top',
    marginRight: 10,
  },
  title: {
    marginBottom: 0,
  },
  updateSchool: {
    fontSize: '85%',
    marginTop: 0,
    marginBottom: 0,
  },
};

export default class CensusTeacherBanner extends Component {
  static propTypes = {
    schoolYear: PropTypes.number.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired,
    onPostpone: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    ncesSchoolId: PropTypes.string.isRequired,
    question: PropTypes.oneOf(['how_many_10_hours', 'how_many_20_hours']).isRequired,
    selection: PropTypes.bool,
    teacherId: PropTypes.number.isRequired,
    teacherName: PropTypes.string.isRequired,
    teacherEmail: PropTypes.string.isRequired,
    showUnknownError: PropTypes.bool,
  };

  componentDidMount() {
    this.loadSchoolName(this.props.ncesSchoolId);
  }

  state = {
    showSchoolInfoForm: false,
    country: 'United States',
    schoolType: '',
    ncesSchoolId: null,
    schoolName: '',
    schoolDisplayName: null,
    schoolState: '',
    schoolZip: '',
    schoolLocation: '',
  };

  handleCountryChange = (_, event) => {
    const newCountry = event ? event.value : '';
    this.setState({country: newCountry});
  }

  handleSchoolTypeChange = (event) => {
    const newType = event ? event.target.value : '';
    this.setState({schoolType: newType});
  }

  handleSchoolChange = (_, event) => {
    const newSchool = event ? event.value : '';
    this.setState({ncesSchoolId: newSchool});
    this.loadSchoolName(newSchool);
  }

  handleSchoolNotFoundChange = (field, event) => {
    const newValue = event ? event.target.value : '';
    this.setState({
      [field]: newValue
    });
  }

  showSchoolInfoForm = () => {
    this.setState({showSchoolInfoForm: true});
  }

  hideSchoolInfoForm = () => {
    this.setState({
      showSchoolInfoForm: false,
      showSchoolInfoErrors: false,
    });
  }

  dismissSchoolInfoForm = () => {
    // Clear any state that may have been set
    this.setState({
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
      showSchoolInfoUnknownError: false,
    });
    this.loadSchoolName(this.props.ncesSchoolId);
  }

  handleSchoolInfoSubmit = () => {
    if (this.schoolInfoInputs.isValid()) {
      $.ajax({
        url: "/users.json",
        type: "post",
        dataType: "json",
        data: $("#census-school-info-form").serialize()
      }).done(this.hideSchoolInfoForm).fail(this.updateSchoolInfoError);
    } else {
      this.setState({
        showSchoolInfoErrors: true,
      });
    }
  }

  updateSchoolInfoError= () => {
    // It isn't clear what could cause an error here since none of the fields are required.
    this.setState({
      showSchoolInfoUnknownError: true,
    });
  }

  loadSchoolName = (schoolId) => {
    if (schoolId && schoolId !== '-1') {
      $.ajax({
        url: `/api/v1/schools/${schoolId}`,
        type: "get",
      }).done(this.loadSchoolNameSuccess).fail(this.loadSchoolNameError);
    } else {
      this.setState({
        schoolDisplayName: ''
      });
    }
  }

  loadSchoolNameSuccess = (response) => {
    this.setState({
      schoolDisplayName: response.name,
      schoolType: response.school_type,
    });
  }

  loadSchoolNameError = (error) => {
    this.setState({
      schoolDisplayName: "your school",
    });
  }

  bindSchoolInfoInputs = (inputs) => {
    this.schoolInfoInputs = inputs;
  }

  render() {
    if (this.state.showSchoolInfoForm) {
      let schoolId = (this.state.ncesSchoolId !== null) ? this.state.ncesSchoolId : this.props.ncesSchoolId;
      return (
        <div style={styles.main}>
          <form name="census-school-info-form" id="census-school-info-form">
            <input type="hidden" name="_method" value="patch" />
            <div style={styles.header}>
              <h2>Update your school information</h2>
              {this.state.showSchoolInfoUnknownError && (
                 <p style={styles.error}>We encountered an error with your submission. Please try again.</p>
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
                useGoogleLocationSearch={true}
                showErrors={this.state.showSchoolInfoErrors}
                showRequiredIndicator={true}
              />
            </div>
            <div style={styles.buttonDiv}>
              <Button onClick={this.dismissSchoolInfoForm} style={styles.button} color="gray" size="large" text="Dismiss" />
              <Button onClick={this.handleSchoolInfoSubmit} style={styles.button} size="large" text="Submit" />
            </div>
          </form>
        </div>
      );
    } else {
      const numHours = (this.props.question === 'how_many_20_hours') ? '20' : '10';
      let  buttons;
      let  footer;
      if (this.props.selection===true) {
        footer = (<hr/>);
        buttons = (
          <div style={styles.buttonDiv}>
            <Button onClick={this.props.onDismiss} style={styles.button} color="gray" size="large" text="No thanks" />
            <Button onClick={this.props.onSubmit} style={styles.button} size="large" text="Add my school to the map!" />
          </div>
        );
      } else if (this.props.selection===false) {
        footer = (
          <div>
            <hr/>
            <p>We’d love to know more about computer science opportunities at your school. Please take our survey to increase access to Computer Science in the US.</p>
          </div>
        );
        buttons = (
          <div style={styles.buttonDiv}>
            <Button onClick={this.props.onPostpone} style={styles.button} color="gray" size="large" text="Not now" />
            <Button onClick={this.props.onPostpone} href={pegasus('/yourschool')} style={styles.button} size="large" text="Take the survey" />
          </div>
        );
      }

      let schoolName;

      if (this.state.schoolDisplayName) {
        schoolName = this.state.schoolDisplayName;
      } else if (this.state.schoolName) {
        schoolName = this.state.schoolName;
      }

      const schoolId = this.state.ncesSchoolId ? this.state.ncesSchoolId : this.props.ncesSchoolId;

      if (schoolName) {
        return (
          <div style={styles.main}>
            <form id="census-teacher-banner-form">
              <input type="hidden" name="nces_school_s" value={schoolId}/>
              <input type="hidden" name="school_year" value={this.props.schoolYear}/>
              {this.state.country && (
                <input type="hidden" name="country_s" value={this.state.country}/>
              )}
              {this.state.schoolType && (
                <input type="hidden" name="school_type_s" value={this.state.schoolType}/>
              )}
              {this.state.schoolName && (
                <input type="hidden" name="school_name_s" value={this.state.schoolName}/>
              )}
              {this.state.schoolState && (
                <input type="hidden" name="school_state_s" value={this.state.schoolState}/>
              )}
              {this.state.schoolZip && (
                <input type="hidden" name="school_zip_s" value={this.state.schoolZip}/>
              )}
              {this.state.schoolLocation && (
                <input type="hidden" name="school_location" value={this.state.schoolLocation}/>
              )}
              <input type="hidden" name="submitter_role" value="TEACHER"/>
              <input type="hidden" name="submitter_name" value={this.props.teacherName}/>
              <input type="hidden" name="submitter_email_address" value={this.props.teacherEmail}/>
              <div style={styles.header}>
                <h2 style={styles.title}>Add {schoolName} to our map!</h2>
                <p style={styles.updateSchool}>Not teaching at this school anymore? <a onClick={this.showSchoolInfoForm}>Update here</a></p>
                {this.props.showUnknownError && (
                   <p style={styles.error}>We encountered an error with your submission. Please try again.</p>
                )}
              </div>
              <div style={styles.message}>
                <p style={styles.introQuestion}>
                  Looks like you teach computer science. Have your students already done {numHours} hours of programming content this year (not including HTML/CSS)?
                </p>
                <label>
                  <input
                    type="radio"
                    id="teachesYes"
                    name={this.props.question}
                    value="SOME"
                    style={styles.radio}
                    onChange={this.props.onChange}
                    checked={this.props.selection===true}
                  />
                  Yes, we’ve done {numHours} hours.
                </label>
                <label>
                  <input
                    type="radio"
                    id="teachesNo"
                    name={this.props.question}
                    style={styles.radio}
                    onChange={this.props.onChange}
                    value="not yet"
                    checked={this.props.selection===false}
                  />
                  Not yet.
                </label>
                {footer}
              </div>
              {buttons}
            </form>
          </div>
          );
      } else {
        // Don't display until school name has been loaded
        return null;
      }
    }
  }
}
