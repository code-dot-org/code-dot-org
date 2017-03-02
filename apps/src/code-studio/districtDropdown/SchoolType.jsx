import React from 'react';

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

export default SchoolType;
