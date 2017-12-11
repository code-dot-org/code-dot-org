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
    // This is handling the case where the user dismissed the
    // "update your school" view, not the entire banner. In that case, there
    // may have been partial state about the school changed. We do not want
    // to use that partial state in the census submission so we need to reset
    // to the previous values.
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
      let schoolData;
      if (this.state.ncesSchoolId === '-1') {
        schoolData = {
          "_method": "patch",
          "user[school_info_attributes][country]": this.state.country,
          "user[school_info_attributes][school_type]": this.state.schoolType,
          "user[school_info_attributes][school_name]": this.state.schoolName,
          "user[school_info_attributes][school_state]": this.state.schoolState,
          "user[school_info_attributes][school_zip]": this.state.schoolZip,
          "user[school_info_attributes][full_address]": this.state.schoolLocation,
        };
      } else {
        schoolData = {
          "_method": "patch",
          "user[school_info_attributes][school_id]": this.state.ncesSchoolId,
        };
      }
      $.ajax({
        url: "/users.json",
        type: "post",
        dataType: "json",
        data: schoolData,
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

  getData = () => {
    const schoolId = this.state.ncesSchoolId ? this.state.ncesSchoolId : this.props.ncesSchoolId;
    let data= {
      submitter_role: "TEACHER",
      submitter_name: this.props.teacherName,
      submitter_email_address: this.props.teacherEmail,
      school_year: this.props.schoolYear,
    };
    data[this.props.question] = "SOME";

    if (schoolId === '-1') {
      data["country_s"] = this.state.country;
      data["school_type_s"] = this.state.schoolType;
      data["school_name_s"] = this.state.schoolName;
      data["school_state_s"] = this.state.schoolState;
      data["school_zip_s"] = this.state.schoolZip;
      data["school_location"] = this.state.schoolLocation;
    } else {
      data["nces_school_s"] = schoolId;
    }

    return data;
  }

  renderSchoolInfoForm() {
    let schoolId = (this.state.ncesSchoolId !== null) ? this.state.ncesSchoolId : this.props.ncesSchoolId;
    return (
      <div style={styles.main}>
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
      </div>
    );
  }

  renderCensusForm() {
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

    if (schoolName) {
      return (
        <div style={styles.main}>
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
        </div>
      );
    } else {
      // Don't display until school name has been loaded
      return null;
    }
  }

  render() {
    if (this.state.showSchoolInfoForm) {
      return this.renderSchoolInfoForm();
    } else {
      return this.renderCensusForm();
    }
  }
}
