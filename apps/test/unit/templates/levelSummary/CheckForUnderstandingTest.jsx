import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import CheckForUnderstanding from '@cdo/apps/templates/levelSummary/CheckForUnderstanding';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import viewAs from '@cdo/apps/code-studio/viewAsRedux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import progress from '@cdo/apps/code-studio/progressRedux';

describe('CheckForUnderstanding', () => {
  it('renders ', () => {
    const jsData = {
      level: {
        type: 'FreeResponse',
        id: 0,
        properties: {
          long_instructions: 'test'
        }
      },
      last_attempt: 'teacher answer',
      responses: []
    };
    const div = document.createElement('div');
    const script = document.createElement('script');
    script.dataset.summary = JSON.stringify(jsData);
    document.head.appendChild(script);
    document.body.appendChild(div);

    const store = createStore(
      combineReducers({
        isRtl,
        viewAs,
        teacherSections,
        progress
      }),
      {
        isRtl: false,
        viewAs: 'Instructor',
        teacherSections: {
          selectedStudents: [],
          selectedSectionId: 0,
          sectionIds: [0],
          sections: [{id: 0, name: 'test section'}]
        },
        progress: {
          currentLessonId: 0,
          currentLevelId: '0',
          lessons: [
            {
              id: 0,
              levels: [{activeId: '0', position: 1}]
            }
          ]
        }
      }
    );

    const wrapper = mount(
      <Provider store={store}>
        <CheckForUnderstanding />
      </Provider>,
      {attachTo: div}
    );

    expect(wrapper.find('.markdown')).to.exist;
  });
});
