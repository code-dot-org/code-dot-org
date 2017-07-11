import React from 'react';
import TeacherAssignablesCatalog from './TeacherAssignablesCatalog';

export default storybook => {
  return storybook
    .storiesOf('TeacherAssignablesCatalog', module)
    .addStoryTable([
      {
        name: 'Catalog of courses and scripts (assignables) for teachers',
        description: `Collection of ResourceCards displaying information about courses and scripts for different grade levels that will be on /courses for teachers`,
        story: () => (
          <TeacherAssignablesCatalog
            codeOrgUrlPrefix="http://localhost:3000/"
            isRtl={false}
          />
        )
      },
    ]);
};
