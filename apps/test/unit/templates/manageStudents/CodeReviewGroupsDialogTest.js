import {isolateComponent} from 'isolate-react';
import React from 'react';

import StylizedBaseDialog from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import Button from '@cdo/apps/templates/Button';
import CodeReviewGroupsManager from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsManager';
import CodeReviewGroupsDialog from '@cdo/apps/templates/manageStudents/CodeReviewGroupsDialog';



describe('CodeReviewGroupsDialog', () => {
  let wrapper, dataApi, fakeGroups;

  beforeEach(() => {
    fakeGroups = [{name: 'fake group'}];

    dataApi = {
      getCodeReviewGroups: () => {
        return {
          done: callback => {
            callback(fakeGroups);
            return {fail: () => {}};
          },
        };
      },
      setCodeReviewGroups: jest.fn().mockReturnValue({
        done: callback => {
          callback();
          return {fail: () => {}};
        },
      }),
    };

    wrapper = isolateComponent(<CodeReviewGroupsDialog dataApi={dataApi} />);
  });

  it('click of button opens dialog', () => {
    expect(wrapper.findOne(StylizedBaseDialog).props.isOpen).toBe(false);
    wrapper.findOne(Button).props.onClick();
    expect(wrapper.findOne(StylizedBaseDialog).props.isOpen).toBe(true);
  });

  it('loads initial group state on initial render', () => {
    expect(wrapper.findOne(CodeReviewGroupsManager).props.groups).toBe(fakeGroups);
  });

  it('disables submit button until groups have changed', () => {
    expect(wrapper.findOne(StylizedBaseDialog).props.disableConfirmationButton).toBe(true);
    wrapper.findOne(CodeReviewGroupsManager).props.setGroups(['something new']);
    expect(wrapper.findOne(StylizedBaseDialog).props.disableConfirmationButton).toBe(false);
  });

  it('sends API request to update groups after confirming changes', () => {
    const newGroups = [{name: 'new group'}];
    wrapper.findOne(CodeReviewGroupsManager).props.setGroups(newGroups);

    expect(wrapper.findOne(CodeReviewGroupsManager).props.groups).toBe(newGroups);
    wrapper.findOne(StylizedBaseDialog).props.handleConfirmation();
    sinon.assert.calledOnceWithExactly(dataApi.setCodeReviewGroups, newGroups);
  });
});
