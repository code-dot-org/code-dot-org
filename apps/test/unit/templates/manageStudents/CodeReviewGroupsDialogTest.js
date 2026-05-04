import {isolateComponent} from 'isolate-react';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import Button from '@cdo/apps/legacySharedComponents/Button';
import StylizedBaseDialog from '@cdo/apps/sharedComponents/StylizedBaseDialog';
import CodeReviewGroupsManager from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsManager';
import CodeReviewGroupsDialog from '@cdo/apps/templates/manageStudents/CodeReviewGroupsDialog';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

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
    expect(wrapper.findOne(StylizedBaseDialog).props.isOpen).to.be.false;
    wrapper.findOne(Button).props.onClick();
    expect(wrapper.findOne(StylizedBaseDialog).props.isOpen).to.be.true;
  });

  it('loads initial group state on initial render', () => {
    expect(wrapper.findOne(CodeReviewGroupsManager).props.groups).to.equal(
      fakeGroups
    );
  });

  it('disables submit button until groups have changed', () => {
    expect(wrapper.findOne(StylizedBaseDialog).props.disableConfirmationButton)
      .to.be.true;
    wrapper.findOne(CodeReviewGroupsManager).props.setGroups(['something new']);
    expect(wrapper.findOne(StylizedBaseDialog).props.disableConfirmationButton)
      .to.be.false;
  });

  it('sends API request to update groups after confirming changes', () => {
    const newGroups = [{name: 'new group'}];
    wrapper.findOne(CodeReviewGroupsManager).props.setGroups(newGroups);

    expect(wrapper.findOne(CodeReviewGroupsManager).props.groups).to.equal(
      newGroups
    );
    wrapper.findOne(StylizedBaseDialog).props.handleConfirmation();
    sinon.assert.calledOnceWithExactly(dataApi.setCodeReviewGroups, newGroups);
  });

  it('does not show alert when all students already had sharing enabled', () => {
    const newGroups = [{name: 'new group'}];
    wrapper.findOne(CodeReviewGroupsManager).props.setGroups(newGroups);
    wrapper.findOne(StylizedBaseDialog).props.handleConfirmation();

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

    const newGroups = [{name: 'new group'}];
    wrapper.findOne(CodeReviewGroupsManager).props.setGroups(newGroups);
    wrapper.findOne(StylizedBaseDialog).props.handleConfirmation();

    sinon.assert.calledOnce(alertStub);
    expect(alertStub.firstCall.args[0]).to.equal(
      'Project sharing (required for code reviews) has been enabled for the following students: Alice, Bob'
    );
  });
});
