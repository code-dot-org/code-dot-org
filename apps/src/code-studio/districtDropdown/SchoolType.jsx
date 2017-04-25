import React from 'react';

const SCHOOL_TYPES = [
  {value:"charter", text:"Charter"},
  {value:"private", text:"Private"},
  {value:"public", text:"Public"},
  {value:"homeschool", text:"Homeschool"},
  {value:"afterschool", text:"After School"},
  {value:"other", text:"Other"}
];

function SchoolType(props) {
  return (
    <div className="itemblock">
      <div className="labelblock">School Type</div>
      <select className="form-control fieldblock" id="school-type" name="user[school_info_attributes][school_type]" type="select" value={props.schoolType} onChange={props.onChange}>
        <option disabled="true" value=""/>
        {
          SCHOOL_TYPES.map((type) =>
            <option
              key={type.value}
              value={type.value}
            >
              {type.text}
            </option>
          )
        }
      </select>
    </div>
  );
}

SchoolType.propTypes = {
  schoolType: React.PropTypes.string,
  onChange: React.PropTypes.func
};

export default SchoolType;
