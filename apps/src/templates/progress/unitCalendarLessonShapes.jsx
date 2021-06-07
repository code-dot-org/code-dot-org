import PropTypes from 'prop-types';

export const unitCalendarLesson = PropTypes.shape({
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  assessment: PropTypes.bool.isRequired,
  unplugged: PropTypes.bool,
  url: PropTypes.string
});

export const unitCalendarLessonChunk = PropTypes.shape({
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  assessment: PropTypes.bool.isRequired,
  unplugged: PropTypes.bool,
  isStart: PropTypes.boolean,
  isEnd: PropTypes.boolean,
  isMajority: PropTypes.boolean,
  url: PropTypes.string
});
