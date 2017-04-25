import React from "react";
import SchoolCountry from "./SchoolCountry";
import SchoolType from "./SchoolType";
import SchoolState from "./SchoolState";

const SchoolInfoBox = React.createClass({
  getInitialState: function () {
    return {
      country: "US",
      schoolType: "",
      schoolState: "",
    };
  },

  handleCountryChange: function (e) {
    this.setState({country: e.target.value});
  },

  handleSchoolTypeChange: function (e) {
    this.setState({schoolType: e.target.value});
  },

  handleSchoolStateChange: function (e) {
    this.setState({schoolState: e.target.value});
  },

  showSchoolState: function () {
    return this.state.country === "US";
  },

  render: function () {
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
});

export default SchoolInfoBox;
