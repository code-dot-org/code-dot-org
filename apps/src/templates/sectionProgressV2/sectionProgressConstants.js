import PropTypes from 'prop-types';

/**
 * Shape for unitData
 * The data we get from the server's call to unit.summarize. The format
 * ends up being similar to that which we send to initProgress in progressRedux.
 * The important part is unitData.lessons, which gets used by levelsWithLesson
 * Note: unit was previously named script
 */
export const unitDataPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  csf: PropTypes.bool,
  title: PropTypes.string,
  path: PropTypes.string,
  lessons: PropTypes.arrayOf(
    PropTypes.shape({
      levels: PropTypes.arrayOf(PropTypes.object).isRequired,
    })
  ),
  family_name: PropTypes.string,
  version_year: PropTypes.string,
  name: PropTypes.string,
});
