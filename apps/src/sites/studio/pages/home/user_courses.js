import React from 'react';
import ReactDOM from 'react-dom';
import CourseCard from '@cdo/apps/templates/teacherHomepage/CourseCard';
import BlockLink from '@cdo/apps/templates/BlockLink';

window.showContent = function (recentCourses, blockLinks) {
  ReactDOM.render(
    <div>
      {recentCourses.map(item => (
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

  ReactDOM.render(
    <div>
      {blockLinks.map((item, index) => (
        <BlockLink
          key={index}
          text={item.text}
          link={item.link}
        />
      ))}
    </div>,
    document.getElementById('block-links-container')
  );
};
