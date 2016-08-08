const TIME_FORMAT = "h:mma";
const DATE_FORMAT = 'MM/DD/YY';
const DATETIME_FORMAT = `${DATE_FORMAT} ${TIME_FORMAT}`;

// The jquery Datepicker uses a different format than moment.
// See http://api.jqueryui.com/datepicker/#utility-formatDate
const DATEPICKER_FORMAT = 'mm/dd/y';

const MAX_SESSIONS = 10;

export {
  TIME_FORMAT,
  DATE_FORMAT,
  DATETIME_FORMAT,
  DATEPICKER_FORMAT,
  MAX_SESSIONS
};
