import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {mount} from 'enzyme';
import sinon from 'sinon';

import * as utils from '@cdo/apps/code-studio/utils';
import RubricSettings from '@cdo/apps/templates/rubrics/RubricSettings';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {Provider} from 'react-redux';

describe('RubricSettings', () => {
  let fetchStub;
  let store;
  beforeEach(() => {
    fetchStub = sinon.stub(window, 'fetch');
    sinon.stub(utils, 'queryParams').withArgs('section_id').returns('1');
    stubRedux();
    registerReducers({teacherSections});
    store = getStore();
  });

  afterEach(() => {
    fetchStub.restore();
    utils.queryParams.restore();
    restoreRedux();
  });
  const defaultRubric = {
    learningGoals: [],
    lesson: {
      position: 3,
      name: 'Data Structures',
    },
    level: {
      name: 'test_level',
      position: 7,
    },
    id: 1,
  };

  it('displays Section selector', () => {
    const returnedJson = {attempted: false};
    fetchStub.returns(
      Promise.resolve(new Response(JSON.stringify(returnedJson)))
    );
    const wrapper = mount(
      <Provider store={store}>
        <RubricSettings
          canProvideFeedback={true}
          teacherHasEnabledAi={true}
          studentUserId={10}
          visible
          rubric={defaultRubric}
          sectionId={2}
        />
      </Provider>
    );
    expect(wrapper.find('SectionSelector').length).to.equal(1);
  });

  //TODO: Add tests for AI assessment for all behaviors
});
