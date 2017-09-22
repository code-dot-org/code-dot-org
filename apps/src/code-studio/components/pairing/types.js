import {PropTypes} from 'react';

const studentsShape = PropTypes.arrayOf(PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string
}));
module.exports.studentsShape = studentsShape;
