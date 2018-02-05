import React, {PropTypes} from 'react';
import $ from 'jquery';
import i18n from '@cdo/locale';
import color from '../../util/color';
import BaseDialog from '../../templates/BaseDialog';
import Button from '../../templates/Button';
import SchoolInfoInputs from '../../templates/SchoolInfoInputs';

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
  }
};

export default class SchoolInfoInterstitial extends React.Component {
  static propTypes = {
    formUrl: PropTypes.string.isRequired,
    authTokenName: PropTypes.string.isRequired,
    authTokenValue: PropTypes.string.isRequired,
    afterClose: PropTypes.func.isRequired,
    existingSchoolInfo: PropTypes.object.isRequired,
  };

  static defaultProps = {
    afterClose: function () {},
  };

  constructor(props) {
    super(props);

    this.state = {
      country: this.props.existingSchoolInfo.country || '',
      schoolType: '',
      schoolName: '',
      schoolState: '',
      schoolZip: '',
      schoolLocation: '',
      ncesSchoolId: '',
    };
  }


  handleSchoolInfoSubmit = () => {
    if (this.schoolInfoInputs.isValid()) {
      let schoolData;
      if (this.state.ncesSchoolId === '-1') {
        schoolData = {
          "user[school_info_attributes][country]": this.state.country,
          "user[school_info_attributes][school_type]": this.state.schoolType,
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
      $.post({
        url: this.props.formUrl + '.json',
        dataType: "json",
        data: {
          '_method': 'patch',
          [this.props.authTokenName]: this.props.authTokenValue,
          ...schoolData,
        },
      }).done(this.hideSchoolInfoForm).fail(this.updateSchoolInfoError);
    } else {
      this.setState({
        showSchoolInfoErrors: true,
      });
    }
  };

  close = () => {
    this.props.afterClose();
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
        handleClose={this.close}
        uncloseable
      >
        <div style={styles.container}>
          <div style={styles.heading}>
            We want to bring Computer Science to every student - help us track our progress!
          </div>
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
