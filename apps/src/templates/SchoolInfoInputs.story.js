import React, { Component, PropTypes }  from 'react';
import SchoolInfoInputs from './SchoolInfoInputs';

export default storybook => {
  class SchoolInfoInputsWrapper extends Component {
    static propTypes = {
      showErrors: PropTypes.bool,
      showRequiredIndicator: PropTypes.bool,
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
        <div>
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
            showErrors={this.props.showErrors}
            showRequiredIndicator={this.props.showRequiredIndicator}
          />
        </div>
      );
    }
  }

  return storybook
    .storiesOf('SchoolInfoInputs', module)
    .addStoryTable([
      {
        name: 'Inputs for school info (not required)',
        description: `Gets school info data.`,
        story: () => (
          <SchoolInfoInputsWrapper/>
        )
      },
      {
        name: 'Inputs for school info (required)',
        description: `Gets school info data.`,
        story: () => (
          <SchoolInfoInputsWrapper
            showErrors={true}
            showRequiredIndicator={true}
          />
        )
      },
    ]);
};
