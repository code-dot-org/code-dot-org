import React from 'react';

const studentsShape = React.PropTypes.arrayOf(React.PropTypes.shape({
  id: React.PropTypes.number,
  name: React.PropTypes.string
}));
module.exports.studentsShape = studentsShape;
