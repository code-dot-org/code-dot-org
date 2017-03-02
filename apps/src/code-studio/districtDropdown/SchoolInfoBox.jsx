import React from "react";
import SchoolCountry from "./SchoolCountry";
import SchoolType from "./SchoolType";
import SchoolState from "./SchoolState";
// import i18n from '@cdo/locale'; // TODO

class SchoolInfoBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      country: "US",
      schoolType: "",
      schoolState: "",
    };
    this.handleCountryChange = this.handleCountryChange.bind(this);
    this.handleSchoolTypeChange = this.handleSchoolTypeChange.bind(this);
    this.handleSchoolStateChange = this.handleSchoolStateChange.bind(this);
  }

  handleCountryChange(e) {
    this.setState({country: e.target.value});
  }

  handleSchoolTypeChange(e) {
    this.setState({schoolType: e.target.value});
  }

  handleSchoolStateChange(e) {
    this.setState({schoolState: e.target.value});
  }

  showSchoolState() {
    return this.state.country === "US";
  }

  render() {
    return (
        <div>
          <h5 style={{fontWeight: "bold"}}>School Information (optional)</h5>
          <hr/>
          <SchoolCountry country={this.state.country} onChange={this.handleCountryChange}/>
          <SchoolType schoolType={this.state.schoolType} onChange={this.handleSchoolTypeChange}/>
          {this.showSchoolState() && <SchoolState schoolState={this.state.schoolState} onChange={this.handleSchoolStateChange}/>}
        </div>
    );
  }
}

export default SchoolInfoBox;
