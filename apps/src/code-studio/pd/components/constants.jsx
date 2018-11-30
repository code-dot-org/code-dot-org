import {PropTypes} from 'react';

const SchoolInfoPropType = PropTypes.shape({
  school_id: PropTypes.string,
  school_name: PropTypes.string,
  school_state: PropTypes.string,
  school_type: PropTypes.string,
  school_zip: PropTypes.string,
  school_district_name: PropTypes.string,
  school_district_other: PropTypes.oneOf(["true", "false"])
});

export {
  SchoolInfoPropType
};
