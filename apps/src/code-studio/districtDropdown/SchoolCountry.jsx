import React from 'react';

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

export default SchoolCountry;
