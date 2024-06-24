import PropTypes from 'prop-types';
import React from 'react';

export default function JobBoard({jobsByDepartment}) {
  const renderDepartment = department => {
    return (
      <div>
        <h3>{department.name}</h3>
        {department.jobs.map(renderJob)}
      </div>
    );
  };

  const renderJob = job => {
    return (
      <div>
        <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
          {job.jobTitle}
        </a>
        <p>{job.location}</p>
      </div>
    );
  };

  if (Object.keys(jobsByDepartment).length === 0) {
    return (
      <div>
        We currently do not have any openings. Please check back another time!
      </div>
    );
  }
  return <div>{Object.values(jobsByDepartment).map(renderDepartment)}</div>;
}

JobBoard.propTypes = {
  jobsByDepartment: PropTypes.object.isRequired,
};
