/* Common shapes used for React prop validation.
 */

import React from 'react';

const shapes = {
  courses: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      courseName: React.PropTypes.string.isRequired,
      description: React.PropTypes.string.isRequired,
      image: React.PropTypes.string.isRequired,
      link: React.PropTypes.string.isRequired,
      assignedSections: React.PropTypes.array.isRequired,
    })
  )
};

export default shapes;
