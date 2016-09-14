/* Common shapes used for React prop validation.
 */

require('babel-polyfill');
import React from 'react';

const shapes = {
  tutorial: React.PropTypes.shape({
    tags_length: React.PropTypes.string,
    tags_subject: React.PropTypes.string,
    tags_teacher_experience: React.PropTypes.string,
    tags_student_experience: React.PropTypes.string,
    tags_activity_type: React.PropTypes.string,
    tags_international_languages: React.PropTypes.string,
    tags_grade: React.PropTypes.string,
    tags_programming_language: React.PropTypes.string
  })
};

export default shapes;
