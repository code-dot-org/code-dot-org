import React from 'react';
import ReactDOM from 'react-dom';
import CourseCard from '@cdo/apps/templates/teacherHomepage/CourseCard';
import GradientNavCard from '@cdo/apps/templates/teacherHomepage/GradientNavCard';

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
        <GradientNavCard
          key={index}
          title={item.text}
          link={item.link}
          description=""
          image="http://code.org/img.png"
          buttonText="Learn more"
        />
      ))}
    </div>,
    document.getElementById('block-links-container')
  );
};
