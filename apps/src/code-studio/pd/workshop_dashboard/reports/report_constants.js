const QUERY_BY_OPTIONS = [
  {option: 'Scheduled Start Date', value: 'schedule'},
  {option: 'Date Marked Ended', value: 'end'}
];

const QUERY_BY_VALUES = QUERY_BY_OPTIONS.map(o => o.value);

export {
  QUERY_BY_OPTIONS,
  QUERY_BY_VALUES
};
