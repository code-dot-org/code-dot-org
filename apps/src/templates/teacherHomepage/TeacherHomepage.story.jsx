import React from 'react';
import TeacherHomepage from './TeacherHomepage';
// import CollapsibleSection from './CollapsibleSection';
// import CourseCard from './CourseCard';
import GradientNavCard from './GradientNavCard';
// import SetUpMessage from './SetUpMessage';
// import Notification from '../Notification';
// import Announcement from './Announcement';
// import Hero from './Hero';

// const CourseCardExample = {
//   courseName: "CSP Unit 2 - Digital Information",
//   description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
//   image: "this is where there will be the source for the photo",
//   link: "link to wherever you want the button to go...",
//   assignedSections: []
// };

const GradientNavCard1 = {
  title: "Teacher Community",
  description: "Ask questions about curriculum, share ideas from your lessons, and get help from other teachers",
  image: "../../static/navcard-placeholder.png",
  buttonText: "Connect Today",
  link: "link to wherever"
};

const GradientNavCard2 = {
  title: "Professional Learning",
  description: "Our highly-rated professional learning prepares you for your next Computer Science course.",
  image: "../../static/navcard-placeholder.png",
  buttonText: "Learn More",
  link: "link to wherever"
};

export default storybook => {
  return storybook
    .storiesOf('TeacherHomepage', module)
    .addStoryTable([
      {
        name: 'Teacher Homepage',
        description: 'Teacher Homepage',
        story: () => (
          <TeacherHomepage>
            <GradientNavCard cardData={GradientNavCard1}/>
            <GradientNavCard cardData={GradientNavCard2}/>
          </TeacherHomepage>
        )
      }
    ]);
};

//

//
