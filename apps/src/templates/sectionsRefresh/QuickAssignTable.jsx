import React from 'react';
import PropTypes from 'prop-types';

export default function QuickAssignTable({marketingAudience, courseOfferings}) {
  return <div>{JSON.stringify(courseOfferings[marketingAudience])}</div>;
}

QuickAssignTable.propTypes = {
  courseOfferings: PropTypes.object.isRequired,
  marketingAudience: PropTypes.string.isRequired
};
