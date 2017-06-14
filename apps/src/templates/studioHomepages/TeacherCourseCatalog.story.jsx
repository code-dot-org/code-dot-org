import React from 'react';
import TeacherCourseCatalog from './TeacherCourseCatalog';

export default storybook => {
  return storybook
    .storiesOf('TeacherCourseCatalog', module)
    .addStoryTable([
      {
        name: 'Catalog of Courses for teachers',
        description: `Collection of ResourceCards displaying information about courses for different grade levels that will be on /courses for teachers`,
        story: () => (
          <TeacherCourseCatalog codeOrgUrlPrefix="http://localhost:3000/"/>
        )
      },
    ]);
};
