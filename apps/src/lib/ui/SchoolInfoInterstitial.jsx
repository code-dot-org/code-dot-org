import React, {PropTypes} from 'react';
import $ from 'jquery';
import i18n from '@cdo/locale';
import color from '../../util/color';
import BaseDialog from '../../templates/BaseDialog';
import Button from '../../templates/Button';
import SchoolInfoInputs, {SCHOOL_TYPES_HAVING_NCES_SEARCH} from '../../templates/SchoolInfoInputs';

const styles = {
  container: {
    margin: 20,
    color: color.charcoal
  },
  heading: {
    fontSize: 16,
    fontFamily: "'Gotham 5r', sans-serif",
  },
  middle: {
    marginTop: 20,
    marginBottom: 20,
    paddingBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
  },
  bottom: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  error: {
    color: color.red,
  },
};

export default class SchoolInfoInterstitial extends React.Component {
  static propTypes = {
    // This component is tightly bound to the HAML view that renders it and
    // populates its props, and similarly to the User update API that
    // it uses to save entered school info.
    scriptData: PropTypes.shape({
      formUrl: PropTypes.string.isRequired,
      authTokenName: PropTypes.string.isRequired,
      authTokenValue: PropTypes.string.isRequired,
      existingSchoolInfo: PropTypes.shape({
        // Note, these names intentionally match the fields on the SchoolInfo
        // model, not their JavaScript-friendly equivalents.  The mapping
        // occurs in the constructor, below, and back when we submit.
        school_id: PropTypes.string,
        country: PropTypes.string,
        school_type: PropTypes.string,
        school_name: PropTypes.string,
        state: PropTypes.string,
        zip: PropTypes.string,
        full_address: PropTypes.string,
      }).isRequired,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
  };

  static defaultProps = {
    onClose: function () {},
  };

  constructor(props) {
    super(props);

    const {existingSchoolInfo} = this.props.scriptData;
    const initialNcesSchoolId = existingSchoolInfo.school_id ?
      existingSchoolInfo.school_id :
      (
        existingSchoolInfo.country === 'United States'
        &&
        SCHOOL_TYPES_HAVING_NCES_SEARCH.includes(existingSchoolInfo.school_type)
        &&
        (existingSchoolInfo.school_name || existingSchoolInfo.state || existingSchoolInfo.zip)
      ) ? '-1' : '';

    this.state = {
      country: existingSchoolInfo.country || '',
      schoolType: existingSchoolInfo.school_type || '',
      schoolName: existingSchoolInfo.school_name || '',
      schoolState: existingSchoolInfo.state || '',
      schoolZip: existingSchoolInfo.zip || '',
      schoolLocation: existingSchoolInfo.full_address || '',
      ncesSchoolId: initialNcesSchoolId,
      showSchoolInfoUnknownError: false,
    };
  }


  handleSchoolInfoSubmit = () => {
    let schoolData;
    if (this.state.ncesSchoolId === '-1') {
      schoolData = {
        "user[school_info_attributes][school_name]": this.state.schoolName,
        "user[school_info_attributes][school_state]": this.state.schoolState,
        "user[school_info_attributes][school_zip]": this.state.schoolZip,
        "user[school_info_attributes][full_address]": this.state.schoolLocation,
      };
    } else {
      schoolData = {
        "user[school_info_attributes][school_id]": this.state.ncesSchoolId,
      };
    }

    const {formUrl, authTokenName, authTokenValue} = this.props.scriptData;
    $.post({
      url: formUrl + '.json',
      dataType: "json",
      data: {
        '_method': 'patch',
        [authTokenName]: authTokenValue,
        "user[school_info_attributes][country]": this.state.country,
        "user[school_info_attributes][school_type]": this.state.schoolType,
        ...schoolData,
      },
    }).done(() => {
      this.props.onClose();
    }).fail(() => {
      if (!this.state.showSchoolInfoUnknownError) {
        // First failure, display error message and give the teacher a chance
        // to try again.
        this.setState({showSchoolInfoUnknownError: true});
      } else {
        // We already failed once, let's not block the teacher any longer.
        // TODO (bbuchanan): Gather metrics on this.
        this.props.onClose();
      }
    });
  };

  onCountryChange = (_, event) => {
    const newCountry = event ? event.value : '';
    this.setState({country: newCountry});
  };

  onSchoolTypeChange = (event) => {
    const newType = event ? event.target.value : '';
    this.setState({schoolType: newType});
  };

  onSchoolChange = (_, event) => {
    const newSchool = event ? event.value : '';
    this.setState({ncesSchoolId: newSchool});
  };

  onSchoolNotFoundChange = (field, event) => {
    let newValue = event ? event.target.value : '';
    this.setState({
      [field]: newValue
    });
  };

  render() {
    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={true}
        handleClose={this.props.onClose}
        uncloseable
      >
        <div style={styles.container}>
          <div style={styles.heading}>
            We want to bring Computer Science to every student - help us track our progress!
          </div>
          {this.state.showSchoolInfoUnknownError && (
            <p style={styles.error}>We encountered an error with your submission. Please try again.</p>
          )}
          <div style={styles.middle}>
            <p>
              Please enter your school information below.
            </p>
            <SchoolInfoInputs
              ref={ref => this.schoolInfoInputs = ref}
              onCountryChange={this.onCountryChange}
              onSchoolTypeChange={this.onSchoolTypeChange}
              onSchoolChange={this.onSchoolChange}
              onSchoolNotFoundChange={this.onSchoolNotFoundChange}
              country={this.state.country}
              schoolType={this.state.schoolType}
              ncesSchoolId={this.state.ncesSchoolId}
              schoolName={this.state.schoolName}
              schoolState={this.state.schoolState}
              schoolZip={this.state.schoolZip}
              schoolLocation={this.state.schoolLocation}
              useGoogleLocationSearch={false}
              showErrors={false}
              showRequiredIndicator={false}
            />
          </div>
          <div style={styles.bottom}>
            <Button
              onClick={this.handleSchoolInfoSubmit}
              text={i18n.save()}
              color={Button.ButtonColor.orange}
            />
          </div>
        </div>
      </BaseDialog>
    );
  }
}
