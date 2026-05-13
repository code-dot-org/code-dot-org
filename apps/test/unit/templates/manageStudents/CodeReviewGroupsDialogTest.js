import Modal from '@code-dot-org/component-library/modal';
import {Button as MuiButton} from '@mui/material';
import {isolateComponent} from 'isolate-react';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import CodeReviewGroupsManager from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsManager';
import CodeReviewGroupsDialog from '@cdo/apps/templates/manageStudents/CodeReviewGroupsDialog';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

// Find a node within a ReactElement tree by component type or display name.
function findInTree(element, matcher) {
  if (!element || typeof element !== 'object') {
    return null;
  }
  if (Array.isArray(element)) {
    for (const child of element) {
      const found = findInTree(child, matcher);
      if (found) {
        return found;
      }
    }
    return null;
  }
  if (element.type === matcher) {
    return element;
  }
  const children = element.props?.children;
  return findInTree(children, matcher);
}

function findGroupsManager(wrapper) {
  const customContent = wrapper.findOne(Modal).props.customContent;
  return findInTree(customContent, CodeReviewGroupsManager);
}

describe('CodeReviewGroupsDialog', () => {
  let wrapper, dataApi, fakeGroups, alertStub;

  beforeEach(() => {
    fakeGroups = [{name: 'fake group'}];
    alertStub = sinon.stub(window, 'alert');

    dataApi = {
      getCodeReviewGroups: () => {
        return {
          done: callback => {
            callback(fakeGroups);
            return {fail: () => {}};
          },
        };
      },
      setCodeReviewGroups: sinon.stub().returns({
        done: callback => {
          callback({students_with_sharing_enabled: []});
          return {fail: () => {}};
        },
      }),
    };

    wrapper = isolateComponent(<CodeReviewGroupsDialog dataApi={dataApi} />);
  });

  afterEach(() => {
    alertStub.restore();
  });

  it('click of button opens dialog', () => {
    expect(wrapper.findAll(Modal).length).to.equal(0);
    wrapper.findOne(MuiButton).props.onClick();
    expect(wrapper.findAll(Modal).length).to.equal(1);
  });

  it('loads initial group state on initial render', () => {
    wrapper.findOne(MuiButton).props.onClick();
    const groupsManager = findGroupsManager(wrapper);
    expect(groupsManager.props.groups).to.equal(fakeGroups);
  });

  it('disables submit button until groups have changed', () => {
    wrapper.findOne(MuiButton).props.onClick();
    expect(wrapper.findOne(Modal).props.primaryButtonProps.disabled).to.be.true;
    findGroupsManager(wrapper).props.setGroups(['something new']);
    expect(wrapper.findOne(Modal).props.primaryButtonProps.disabled).to.be
      .false;
  });

  it('sends API request to update groups after confirming changes', () => {
    wrapper.findOne(MuiButton).props.onClick();
    const newGroups = [{name: 'new group'}];
    findGroupsManager(wrapper).props.setGroups(newGroups);

    expect(findGroupsManager(wrapper).props.groups).to.equal(newGroups);
    wrapper.findOne(Modal).props.primaryButtonProps.onClick();
    sinon.assert.calledOnceWithExactly(dataApi.setCodeReviewGroups, newGroups);
  });

  it('does not show alert when all students already had sharing enabled', () => {
    wrapper.findOne(MuiButton).props.onClick();
    const newGroups = [{name: 'new group'}];
    findGroupsManager(wrapper).props.setGroups(newGroups);
    wrapper.findOne(Modal).props.primaryButtonProps.onClick();

    sinon.assert.notCalled(alertStub);
  });

  it('shows alert when backend updated students with sharing formerly disabled', () => {
    // Update the mock to return students with sharing enabled
    dataApi.setCodeReviewGroups = sinon.stub().returns({
      done: callback => {
        callback({
          students_with_sharing_enabled: ['Alice', 'Bob'],
        });
        return {fail: () => {}};
      },
    });

    wrapper.findOne(MuiButton).props.onClick();
    const newGroups = [{name: 'new group'}];
    findGroupsManager(wrapper).props.setGroups(newGroups);
    wrapper.findOne(Modal).props.primaryButtonProps.onClick();

    sinon.assert.calledOnce(alertStub);
    expect(alertStub.firstCall.args[0]).to.equal(
      'Project sharing (required for code reviews) has been enabled for the following students: Alice, Bob'
    );
  });
});
