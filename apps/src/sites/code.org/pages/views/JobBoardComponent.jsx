import React from 'react';
import PropTypes from 'prop-types';

// rename this file
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
    return <div>No jobs are available at this time. Check back soon!</div>;
  }
  return <div>{Object.values(jobsByDepartment).map(renderDepartment)}</div>;
}

JobBoard.propTypes = {
  jobsByDepartment: PropTypes.object.isRequired
};
