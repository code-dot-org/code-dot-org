import React from 'react';
import VersionHistoryWithCommits from './VersionHistoryWithCommits';

export default storybook => {
  storybook
    .storiesOf('VersionHistoryWithCommits', module)
    .add('Overview with even number', () => (
      <VersionHistoryWithCommits
        handleClearPuzzle={() => {}}
        isProjectTemplateLevel={false}
        useFilesApi
        versions={[
          {
            lastModified: '4/14/2021 11:16:06 AM',
            isLatest: true,
            versionId: '3'
          },
          {
            lastModified: '4/14/2021 11:06:36 AM',
            isLatest: false,
            versionId: '2',
            comment: 'This is my commit comment.'
          },
          {
            lastModified: '4/13/2021 10:16:06 AM',
            isLatest: false,
            versionId: '1',
            comment: 'This is an earlier comment.'
          },
          {
            lastModified: '4/3/2021 10:16:06 PM',
            isLatest: false,
            versionId: '-1'
          }
        ]}
      />
    ));

  storybook
    .storiesOf('VersionHistoryWithCommits', module)
    .add('Overview with odd number', () => (
      <VersionHistoryWithCommits
        handleClearPuzzle={() => {}}
        isProjectTemplateLevel={false}
        useFilesApi
        versions={[
          {
            lastModified: '4/14/2021 11:16:06 AM',
            isLatest: true,
            versionId: '3'
          },
          {
            lastModified: '4/14/2021 11:06:36 AM',
            isLatest: false,
            versionId: '2',
            comment: 'This is my commit comment.'
          },
          {
            lastModified: '4/13/2021 10:16:06 AM',
            isLatest: false,
            versionId: '1'
          }
        ]}
      />
    ));
};
