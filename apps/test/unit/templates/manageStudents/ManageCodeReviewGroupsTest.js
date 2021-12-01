import React, {useState, useEffect} from 'react';
import ManageCodeReviewGroups from '@cdo/apps/templates/manageStudents/ManageCodeReviewGroups';
import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';
import {shallow, mount} from 'enzyme';
import Button from '@cdo/apps/templates/Button';
import CodeReviewGroupsDataApi from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsDataApi';
import {isolateComponent} from 'isolate-components';
import StylizedBaseDialog from '@cdo/apps/componentLibrary/StylizedBaseDialog';
// import CodeReviewGroupsStatusToggle from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsStatusToggle';

describe('ManageCodeReviewGroups', () => {
  let wrapper, api;

  beforeEach(() => {
    api = {
      getCodeReviewGroups: () => {
        console.log('called getCodeReviewGroups');
        return {
          then: callback => {
            callback([]);
          }
          // fail: () => {}
        }; //sinon.stub().callArgWith(0, [])}}
      }
    };

    wrapper = isolateComponent(<ManageCodeReviewGroups api={api} />);
  });
  // try with resolves and rejects
  it('click of button opens dialog', () => {
    expect(wrapper.findOne(StylizedBaseDialog).props.isOpen).to.be.false;
    wrapper.findOne(Button).props.onClick();
    expect(wrapper.findOne(StylizedBaseDialog).props.isOpen).to.be.true;
  });

  it('loads initial group state on render', () => {
    // sinon.stub(React, 'useEffect').callsArg(0)
    // let api = new CodeReviewGroupsDataApi(123);
    // let dataApi = sinon.stub(api, "getCodeReviewGroups").resolves([]);
    // dataApi.rejects()
    // function callback() {
    // }
    // let api = {
    //   getCodeReviewGroups: sinon.stub().resolves(() => sinon.stub().callArgWith(0, []))
    // }
    // wrapper.findOne(Button).props.onClick.simulate("click");
    // console.log(wrapper.debug());
  });
});
