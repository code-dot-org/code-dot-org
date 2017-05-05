import React from 'react';
import ReactDOM from 'react-dom';
import CourseCard from '@cdo/apps/templates/teacherHomepage/CourseCard';

$(document).ready(showRecentCourses);

function showRecentCourses() {
  const recentCoursesData = document.querySelector('script[data-recentcourses]');
  const config = JSON.parse(recentCoursesData.dataset.recentcourses);

  ReactDOM.render(
    <div>
      {config.map(item => (
        <CourseCard
          key={item.id}
          courseName={item.name}
          description={item.description}
          image={item.image}
          link={item.link}
          assignedSections={[]}
        />
      ))}
    </div>,
    document.getElementById('recent-courses-container')
  );
}
