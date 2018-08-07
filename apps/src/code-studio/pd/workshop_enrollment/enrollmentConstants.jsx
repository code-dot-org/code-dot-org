import {PropTypes} from 'react';

const TEACHING_ROLES = [
  "Classroom Teacher",
  "Librarian",
  "Tech Teacher/Media Specialist"
];

const ROLES = TEACHING_ROLES.concat([
  "Parent",
  "School Administrator",
  "District Administrator",
  "Other"
]);

const GRADES_TEACHING = [
  "Pre-K",
  "Kindergarten",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6-8",
  "Grade 9-12"
];

const OTHER_SCHOOL_VALUE = "-1";

const CSF = "CS Fundamentals";

const ERROR = "error";

const SUBMISSION_STATUSES = {
  UNSUBMITTED: "unsubmitted",
  DUPLICATE: "duplicate",
  OWN: "own",
  CLOSED: "closed",
  FULL: "full",
  NOT_FOUND: "not found",
  SUCCESS: "success",
  UNKNOWN_ERROR: "error"
};

const SCHOOL_TYPES = {
  PUBLIC: "Public school",
  PRIVATE: "Private school",
  CHARTER: "Charter school",
  OTHER: "Other"
};

const SCHOOL_TYPES_MAPPING = {
  "Public school": "public",
  "Private school": "private",
  "Charter school": "charter",
  "Other": "other"
};

const WorkshopPropType = PropTypes.shape({
  id: PropTypes.number,
  course: PropTypes.string,
  course_url: PropTypes.string,
  location_name: PropTypes.string,
  location_address: PropTypes.string,
  subject: PropTypes.string,
  notes: PropTypes.string,
  regional_partner: PropTypes.shape({
    name: PropTypes.string
  }),
  organizer: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string
  }),
});

const FacilitatorPropType = PropTypes.shape({
  email: PropTypes.string,
  image_path: PropTypes.string,
  bio: PropTypes.string
});

export {
  TEACHING_ROLES,
  ROLES,
  GRADES_TEACHING,
  OTHER_SCHOOL_VALUE,
  CSF,
  ERROR,
  SUBMISSION_STATUSES,
  SCHOOL_TYPES,
  SCHOOL_TYPES_MAPPING,
  WorkshopPropType,
  FacilitatorPropType
};
