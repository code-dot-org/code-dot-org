import React from 'react';
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

  };

  state = {
    country: '',
    schoolType: '',
    ncesSchoolId: '',
    schoolName: '',
    schoolCity: '',
    schoolState: '',
    schoolZip: '',
  };

  onCountryChange(_, event) {
    const newCountry = event ? event.value : '';
    this.setState({country: newCountry});
  }

  onSchoolTypeChange(event) {
    const newType = event ? event.target.value : '';
    this.setState({schoolType: newType});
  }

  onSchoolChange(_, event) {
    const newSchool = event ? event.value : '';
    this.setState({ncesSchoolId: newSchool});
  }

  onSchoolNotFoundChange(field, event) {
    let newValue = event ? event.target.value : '';
    this.setState({
      [field]: newValue
    });
  }

  render() {
    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={true}
        handleClose={() => {}}
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
              useGoogleLocationSearch={false}
              onCountryChange={this.onCountryChange.bind(this)}
              onSchoolTypeChange={this.onSchoolTypeChange.bind(this)}
              onSchoolChange={this.onSchoolChange.bind(this)}
              onSchoolNotFoundChange={this.onSchoolNotFoundChange.bind(this)}
              country={this.state.country}
              schoolType={this.state.schoolType}
              ncesSchoolId={this.state.ncesSchoolId}
              schoolName={this.state.schoolName}
              schoolCity={this.state.schoolCity}
              schoolState={this.state.schoolState}
              schoolZip={this.state.schoolZip}
              showErrors={false}
              showRequiredIndicator={false}
            />
          </div>
          <div style={styles.bottom}>
            <Button
              href={`/users/sign_up?user_return_to=${location.pathname}`}
              text={i18n.save()}
              color={Button.ButtonColor.orange}
            />
          </div>
        </div>
      </BaseDialog>
    );
  }
}
