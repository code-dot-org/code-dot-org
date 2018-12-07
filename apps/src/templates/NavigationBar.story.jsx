import React from 'react';
import NavigationBar from './NavigationBar';

const links = [
  {
    id: "manageStudents",
    label: "Manage Students",
  },
  {
    id: "projects",
    label: "Projects",
  },
  {
    id: "stats",
    label: "Stats",
  },
  {
    id: "textResponses",
    label: "Text Responses",
  },
  {
    id: "progress",
    label: "Progress",
  },
];

export default storybook => {
  return storybook
    .storiesOf('NavigationBar', module)
    .addStoryTable([
      {
        name: 'NavigationBar',
        description: 'NavigationBar used on Teacher Dashboard',
        story: () => (
          <NavigationBar
            defaultActiveLink = "manageStudents"
            links = {links}
          />
        )
      }
    ]);
};
