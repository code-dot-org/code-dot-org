const QUERY_BY_OPTIONS = [
  {option: 'Scheduled Start Date', value: 'schedule'},
  {option: 'Date The Workshop Ended', value: 'end'}
];
const QUERY_BY_VALUES = QUERY_BY_OPTIONS.map(o => o.value);

const COURSE_OPTIONS = [
  {option: 'All', value: ''},
  {option: 'CSF', value: 'csf'},
  {option: 'Non-CSF', value: '-csf'}
];
const COURSE_VALUES = COURSE_OPTIONS.map(o => o.value);

export {
  QUERY_BY_OPTIONS,
  QUERY_BY_VALUES,
  COURSE_OPTIONS,
  COURSE_VALUES
};
