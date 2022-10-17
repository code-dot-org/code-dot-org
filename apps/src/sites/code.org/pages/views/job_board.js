import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import JobBoard from './JobBoardComponent';

$(document).ready(showJobBoard);

function showJobBoard() {
  const jobBoardElement = $('#job-board-container');
  const jobsByDepartment = {};

  $.ajax({
    type: 'GET',
    url: 'https://boards-api.greenhouse.io/v1/boards/codeorg/jobs?content=true'
  })
    .done(result => {
      result.jobs.forEach(job => {
        const departmentName = job.departments[0].name;
        if (!departmentName) {
          return;
        }

        if (departmentName in jobsByDepartment) {
          const jobDetails = getJobDetails(job);
          jobsByDepartment[departmentName].jobs.push(jobDetails);
        } else {
          jobsByDepartment[departmentName] = {
            name: departmentName,
            jobs: [getJobDetails(job)]
          };
        }
      });
    })
    .complete(() => {
      ReactDOM.render(
        <JobBoard jobsByDepartment={jobsByDepartment} />,
        jobBoardElement[0]
      );
    });
}

const getJobDetails = job => {
  return {
    jobTitle: job.title,
    location: job.location.name,
    applicationUrl: job.absolute_url
  };
};
