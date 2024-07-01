import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {getCurrentUnitData} from '../sectionProgress/sectionProgressRedux';

function FloatingHeader({
  lessons,
  expandedLessonIds,
  addExpandedLesson,
  removeExpandedLesson,
}) {}

FloatingHeader.propTypes = {
  isSortedByFamilyName: PropTypes.bool,
  sectionId: PropTypes.number,
  unitData: PropTypes.array,
  expandedLessonIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  addExpandedLesson: PropTypes.func.isRequired,
  removeExpandedLesson: PropTypes.func.isRequired,
};

export default connect(state => ({
  lessons: getCurrentUnitData(state).lessons,
}))(FloatingHeader);
