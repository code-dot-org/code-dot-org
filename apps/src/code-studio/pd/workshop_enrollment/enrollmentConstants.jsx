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
  SUCCESS: "success"
};

const SCHOOL_TYPES = {
  PUBLIC: "Public school",
  PRIVATE: "Private school",
  CHARTER: "Charter school",
  OTHER: "Other"
};

export {
  TEACHING_ROLES,
  ROLES,
  GRADES_TEACHING,
  OTHER_SCHOOL_VALUE,
  CSF,
  ERROR,
  SUBMISSION_STATUSES,
  SCHOOL_TYPES
};
