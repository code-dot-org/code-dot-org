import React from 'react';
import sinon from 'sinon';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';
import {mount} from 'enzyme';

import {expect} from '../../../../util/reconfiguredChai';
import {replaceOnWindow, restoreOnWindow} from '../../../../util/testUtils';

import headerReducer, {
  refreshProjectName
} from '@cdo/apps/code-studio/headerRedux';
import EditableProjectName from '@cdo/apps/code-studio/components/header/EditableProjectName';

describe('EditableProjectName', () => {
  let currentName;
  beforeEach(() => {
    currentName = 'Brand New Project';
    replaceOnWindow('dashboard', {
      project: {
        rename: (name, cb) => {
          currentName = name;
          cb();
        },
        getCurrentName: () => currentName
      },
      header: {
        updateTimestamp: () => {}
      }
    });
  });

  afterEach(() => {
    restoreOnWindow('dashboard');
  });

  it('provides a "rename project" interface', () => {
    const store = createStore(combineReducers({header: headerReducer}));
    store.dispatch(refreshProjectName());
    const wrapper = mount(
      <Provider store={store}>
        <EditableProjectName />
      </Provider>
    );

    // Initially displays the project name and an edit button
    expect(wrapper.find('.project_name').text()).to.equal('Brand New Project');
    expect(wrapper.find('.project_name').type()).to.equal('div');
    expect(wrapper.find('.project_edit')).to.have.lengthOf(1);
    expect(wrapper.find('.project_save')).to.have.lengthOf(0);

    // Clicking the edit button displays an input and a save button
    wrapper.find('.project_edit').simulate('click');
    expect(wrapper.find('.project_name').type()).to.equal('input');
    expect(wrapper.find('.project_edit')).to.have.lengthOf(0);
    expect(wrapper.find('.project_save')).to.have.lengthOf(1);

    // Modifying the input and clicking save will update the name
    const renameSpy = sinon.spy(window.dashboard.project, 'rename');
    wrapper.find('.project_name').get(0).value = 'New Name';
    wrapper.find('.project_save').simulate('click');
    expect(renameSpy.calledOnce).to.be.true;
    expect(renameSpy.calledWith('New Name')).to.be.true;
    expect(wrapper.find('.project_name').type()).to.equal('div');
    expect(wrapper.find('.project_edit')).to.have.lengthOf(1);
    expect(wrapper.find('.project_save')).to.have.lengthOf(0);
    renameSpy.restore();
  });
});
