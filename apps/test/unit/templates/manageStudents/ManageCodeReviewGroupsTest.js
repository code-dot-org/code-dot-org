import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import Button from '@cdo/apps/templates/Button';
import StylizedBaseDialog from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import ManageCodeReviewGroups from '@cdo/apps/templates/manageStudents/ManageCodeReviewGroups';
import CodeReviewGroupsManager from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsManager';
import CodeReviewGroupsDataApi from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsDataApi';

describe('Manage Code Review Groups on Teacher Dashboard', () => {
  let wrapper, getCodeReviewGroups;

  beforeEach(() => {
    wrapper = shallow(<ManageCodeReviewGroups sectionId={123} />);
    getCodeReviewGroups = sinon.stub(
      CodeReviewGroupsDataApi.prototype,
      'getCodeReviewGroups'
    );
  });

  afterEach(() => {
    getCodeReviewGroups.restore();
  });

  it('enables submit button once groups have been updated', () => {
    getCodeReviewGroups.returns({
      then: callback => callback([{test: 'group'}])
    });

    console.log(wrapper.debug());
    // console.log(wrapper.find(StylizedBaseDialog).props());
    // console.log(wrapper.find(CodeReviewGroupsManager).props().groups);
    wrapper.find(Button).simulate('click');
    wrapper.update();

    console.log(wrapper.find(StylizedBaseDialog).debug());
    expect(wrapper.find(StylizedBaseDialog).length).to.equal(1);

    expect(wrapper.find(CodeReviewGroupsManager).length).to.equal(1);
  });

  it('renders success message when in success state', () => {});

  it('renders error message when in error state', () => {});

  it('enables submit button once groups have been updated', () => {});
});
