import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import EditableProjectName from '@cdo/apps/code-studio/components/header/EditableProjectName';
import projectReducer, {
  refreshProjectName,
} from '@cdo/apps/code-studio/projectRedux';
import lab2Redux from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';

import {expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports
import {replaceOnWindow, restoreOnWindow} from '../../../../util/testUtils';

describe('EditableProjectName', () => {
  let currentName;
  const store = createStore(
    combineReducers({project: projectReducer, lab: lab2Redux})
  );

  beforeEach(() => {
    currentName = 'Brand New Project';
    replaceOnWindow('dashboard', {
      project: {
        rename: name => {
          currentName = name;
          return Promise.resolve();
        },
        getCurrentName: () => currentName,
      },
      header: {
        updateTimestamp: () => {},
      },
    });
  });

  afterEach(() => {
    restoreOnWindow('dashboard');
  });

  it('provides a "rename project" interface', async () => {
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
    wrapper.find('.project_name').getDOMNode().value = 'New Name';
    wrapper.find('.project_save').simulate('click');
    expect(renameSpy.calledOnce).to.be.true;
    expect(renameSpy.calledWith('New Name')).to.be.true;

    // This manual wait-and-update is needed because a rename is an async operation,
    // which we're faking in our test, and enzyme doesn't always re-render when needed
    // in this situation.
    await new Promise(resolve => setTimeout(resolve, 0));
    wrapper.update();

    expect(wrapper.find('.project_name').type()).to.equal('div');
    expect(wrapper.find('.project_edit')).to.have.lengthOf(1);
    expect(wrapper.find('.project_save')).to.have.lengthOf(0);
    renameSpy.restore();
  });

  it('calls lab2 rename if lab2 projects are enabled', () => {
    const renameStub = sinon.stub().returns(Promise.resolve());
    const projectManagerStub = sinon.createStubInstance(ProjectManager, {
      rename: renameStub,
    });
    sinon
      .stub(Lab2Registry, 'getInstance')
      .returns({getProjectManager: () => projectManagerStub});
    sinon.stub(Lab2Registry, 'hasEnabledProjects').returns(true);

    const wrapper = mount(
      <Provider store={store}>
        <EditableProjectName />
      </Provider>
    );

    // Clicking the edit button displays an input and a save button
    wrapper.find('.project_edit').simulate('click');

    wrapper.find('.project_name').getDOMNode().value = 'New Name';
    wrapper.find('.project_save').simulate('click');
    expect(renameStub.calledOnce).to.be.true;
    expect(renameStub.calledWith('New Name')).to.be.true;

    Lab2Registry.getInstance.restore();
    Lab2Registry.hasEnabledProjects.restore();
  });
});
