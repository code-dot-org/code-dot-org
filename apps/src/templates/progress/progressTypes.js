import { PropTypes } from 'react';

export const levelType = (
  PropTypes.shape({
    status: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    name: PropTypes.string,
    icon: PropTypes.string
  })
);

/**
 * @typedef {Object} Lesson
 *
 * @property {string} name
 * @property {number} id
 * @property {bool} lockable
 * @property {number} stageNumber
 */
export const lessonType = (
  PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    lockable: PropTypes.bool.isRequired,
    stageNumber: PropTypes.number,
    lesson_plan_html_url: PropTypes.string,
  })
);
