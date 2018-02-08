/* Common shapes used for React prop validation.
 */

import {PropTypes} from 'react';

const shapes = {
  tutorial: PropTypes.shape({
    tags_length: PropTypes.string,
    tags_subject: PropTypes.string,
    tags_student_experience: PropTypes.string,
    tags_activity_type: PropTypes.string,
    tags_international_languages: PropTypes.string,
    tags_grade: PropTypes.string,
    tags_programming_language: PropTypes.string
  })
};

export default shapes;
