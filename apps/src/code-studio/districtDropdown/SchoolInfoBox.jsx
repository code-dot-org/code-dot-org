import React from 'react';
// import i18n from '@cdo/locale'; // TODO

function SchoolCountry(props) {
  return (
    <div className="itemblock">
      <div className="labelblock">School Country</div>
      <select className="form-control fieldblock" id="school-country" name="user[school_info_attributes][country]" type="select" value={props.country} onChange={props.onChange}>
        <option value="US">United States</option>
        <option value="AD">Andorra</option>
        <option value="AE">United Arab Emirates</option>
      </select>
    </div>
  );
}

SchoolCountry.propTypes = {
  country: React.PropTypes.string,
  onChange: React.PropTypes.func
};

function SchoolType(props) {
  return (
    <div className="itemblock">
      <div className="labelblock">School Type</div>
      <select className="form-control fieldblock" id="school-type" name="user[school_info_attributes][school_type]" type="select" value={props.schoolType} onChange={props.onChange}>
        <option disabled="true" value=""/>
        <option value="charter">Charter</option>
        <option value="private">Private</option>
        <option value="public">Public</option>
        <option value="homeschool">Homeschool</option>
        <option value="afterschool">After School</option>
        <option value="other">Other</option>
      </select>
    </div>
  );
}

SchoolType.propTypes = {
  schoolType: React.PropTypes.string,
  onChange: React.PropTypes.func
};

function SchoolState(props) {
  return (
    <div className="itemblock">
      <div className="labelblock">State</div>
      <select className="form-control fieldblock" id="school-state" name="user[school_info_attributes][school_state]" type="select" value={props.schoolState} onChange={props.onChange}>
        <option disabled="true" value=""/>
        <option value="AL">Alabama</option>
        <option value="AK">Alaska</option>
        <option value="AZ">Arizona</option>
        <option value="AR">Arkansas</option>
        <option value="CA">California</option>
        <option value="CO">Colorado</option>
        <option value="CT">Connecticut</option>
        <option value="DE">Delaware</option>
        <option value="FL">Florida</option>
        <option value="GA">Georgia</option>
        <option value="HI">Hawaii</option>
        <option value="ID">Idaho</option>
        <option value="IL">Illinois</option>
        <option value="IN">Indiana</option>
        <option value="IA">Iowa</option>
        <option value="KS">Kansas</option>
        <option value="KY">Kentucky</option>
        <option value="LA">Louisiana</option>
        <option value="ME">Maine</option>
        <option value="MD">Maryland</option>
        <option value="MA">Massachusetts</option>
        <option value="MI">Michigan</option>
        <option value="MN">Minnesota</option>
        <option value="MS">Mississippi</option>
        <option value="MO">Missouri</option>
        <option value="MT">Montana</option>
        <option value="NE">Nebraska</option>
        <option value="NV">Nevada</option>
        <option value="NH">New Hampshire</option>
        <option value="NJ">New Jersey</option>
        <option value="NM">New Mexico</option>
        <option value="NY">New York</option>
        <option value="NC">North Carolina</option>
        <option value="ND">North Dakota</option>
        <option value="OH">Ohio</option>
        <option value="OK">Oklahoma</option>
        <option value="OR">Oregon</option>
        <option value="PA">Pennsylvania</option>
        <option value="RI">Rhode Island</option>
        <option value="SC">South Carolina</option>
        <option value="SD">South Dakota</option>
        <option value="TN">Tennessee</option>
        <option value="TX">Texas</option>
        <option value="UT">Utah</option>
        <option value="VT">Vermont</option>
        <option value="VA">Virginia</option>
        <option value="WA">Washington</option>
        <option value="DC">Washington DC</option>
        <option value="WV">West Virginia</option>
        <option value="WI">Wisconsin</option>
        <option value="WY">Wyoming</option>
      </select>
    </div>
  );
}

SchoolState.propTypes = {
  schoolState: React.PropTypes.string,
  onChange: React.PropTypes.func
};

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

  handleCountryChange(e) {this.setState({country: e.target.value});}
  handleSchoolTypeChange(e) {this.setState({schoolType: e.target.value});}
  handleSchoolStateChange(e) {this.setState({schoolState: e.target.value});}

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
