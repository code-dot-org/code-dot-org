import React from 'react';
import {UnconnectedStandardsPrintView as StandardsPrintView} from './StandardsPrintView';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import sectionStandardsProgress from './sectionStandardsProgressRedux';
import sectionData from '@cdo/apps/redux/sectionDataRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import scriptSelection from '@cdo/apps/redux/scriptSelectionRedux';
import progress from '@cdo/apps/code-studio/progressRedux';

export default storybook => {
  const store = createStore(
    combineReducers({
      sectionStandardsProgress,
      sectionData,
      sectionProgress,
      scriptSelection,
      progress
    })
  );
  return storybook
    .storiesOf('Standards/StandardsPrintView', module)
    .add('overview', () => {
      return (
        <Provider store={store}>
          <StandardsPrintView
            section={{
              id: 6,
              script: {
                id: 1163,
                name: 'express-2019',
                project_sharing: true
              },
              students: [],
              stageExtras: false
            }}
            scriptData={{
              id: 1163,
              excludeCsfColumnInLegend: false,
              title: 'Express Course (2019)',
              path: '//localhost-studio.code.org:3000/s/express-2019',
              stages: []
            }}
            scriptFriendlyName="Express Course (2019)"
            scriptDescription="This is the description of the script that will show up on the script overview page and now on the standards report"
            numStudentsInSection={15}
            teacherName="Great Teacher"
            sectionName="My Amazing Section"
            numLessonsCompleted={5}
            numLessonsInUnit={10}
            teacherComment="Our class has been working so hard lately to learn computer science. The kids are having a blast and really enjoying getting to create cool projects. Plus they are learning to type better"
          />
        </Provider>
      );
    })
    .add('No Teacher Comment', () => {
      return (
        <Provider store={store}>
          <StandardsPrintView
            section={{
              id: 6,
              script: {
                id: 1163,
                name: 'express-2019',
                project_sharing: true
              },
              students: [],
              stageExtras: false
            }}
            scriptData={{
              id: 1163,
              excludeCsfColumnInLegend: false,
              title: 'Express Course (2019)',
              path: '//localhost-studio.code.org:3000/s/express-2019',
              stages: []
            }}
            scriptFriendlyName="Express Course (2019)"
            scriptDescription="This is the description of the script that will show up on the script overview page and now on the standards report"
            numStudentsInSection={15}
            teacherName="Great Teacher"
            sectionName="My Amazing Section"
            numLessonsCompleted={5}
            numLessonsInUnit={10}
          />
        </Provider>
      );
    });
};
