import PropTypes from 'prop-types';

/**
 * Shape for scriptData
 * The data we get from the server's call to script.summarize. The format
 * ends up being similar to that which we send to initProgress in progressRedux.
 * The important part is scriptData.stages, which gets used by levelsWithLesson
 */
export const scriptDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  csf: PropTypes.bool,
  hasStandards: PropTypes.bool,
  title: PropTypes.string,
  path: PropTypes.string,
  stages: PropTypes.arrayOf(
    PropTypes.shape({
      levels: PropTypes.arrayOf(PropTypes.object).isRequired
    })
  ),
  family_name: PropTypes.string,
  version_year: PropTypes.string
});

// Types of views of the progress tab
export const ViewType = {
  SUMMARY: 'summary', // lessons
  DETAIL: 'detail', // levels
  STANDARDS: 'standards'
};

export const tooltipIdForStudent = studentId =>
  `tooltipIdForStudent${studentId}`;
