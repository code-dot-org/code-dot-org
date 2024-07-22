import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import JobBoard from '@cdo/apps/templates/jobBoard/JobBoard';

$(document).ready(showJobBoard);

function showJobBoard() {
  const jobBoardElement = $('#job-board-container');
  const jobsByDepartment = {};

  $.ajax({
    type: 'GET',
    url: 'https://boards-api.greenhouse.io/v1/boards/codeorg/jobs?content=true',
  })
    .done(result => {
      // Reshape into an object with jobs by department. Shape:
      // {
      //   departmentName: "Engineering",
      //   jobs: [
      //           {
      //             jobTitle: "Software Engineer"
      //             location: "Seattle",
      //             applicationUrl: "https://boards.greenhouse.io/codeorg/jobs/4098667005"
      //           },...
      //   ]
      // }
      result.jobs.forEach(job => {
        // Jobs should always have a department, but optional chaining just in case.
        const departmentName = job?.departments[0]?.name;
        if (!departmentName) {
          return;
        }

        if (departmentName in jobsByDepartment) {
          const jobDetails = getJobDetails(job);
          jobsByDepartment[departmentName].jobs.push(jobDetails);
        } else {
          jobsByDepartment[departmentName] = {
            name: departmentName,
            jobs: [getJobDetails(job)],
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
    applicationUrl: job.absolute_url,
  };
};
