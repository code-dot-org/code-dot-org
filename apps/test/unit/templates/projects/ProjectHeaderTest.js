import React from 'react';
import {mount} from 'enzyme';
import {assert} from '../../../util/configuredChai';
import ProjectHeader from '@cdo/apps/templates/projects/ProjectHeader.jsx';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';
import {Provider} from "react-redux";
import {stubRedux, restoreRedux, getStore} from "@cdo/apps/redux";

describe('ProjectHeader', () => {
  beforeEach(stubRedux);
  afterEach(restoreRedux);

  const store = getStore();

  it('Project count data renders properly in subheading ', () => {
    const wrapper = mount(
        <Provider store={store}>
          <ProjectHeader
            canViewAdvancedTools={true}
            projectCount={10}
          />
        </Provider>,
    );
    assert.equal(wrapper.find(HeaderBanner).props().subHeadingText, 'Over 10 million projects created');
  });
});
