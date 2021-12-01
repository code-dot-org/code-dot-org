import React, {useState, useEffect} from 'react';
import ManageCodeReviewGroups from '@cdo/apps/templates/manageStudents/ManageCodeReviewGroups';
import sinon from 'sinon';
import {shallow, mount} from 'enzyme';
import Button from '@cdo/apps/templates/Button';
import CodeReviewGroupsDataApi from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsDataApi';
import {isolateComponent} from 'isolate-components';
// import CodeReviewGroupsStatusToggle from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsStatusToggle';

describe('ManageCodeReviewGroups', () => {

  // try with resolves and rejects
  it('first test', () => {
    // sinon.stub(React, 'useEffect').callsArg(0)

    // let api = new CodeReviewGroupsDataApi(123);
    // let dataApi = sinon.stub(api, "getCodeReviewGroups").resolves([]);
    // dataApi.rejects()
    // function callback() {

    // }
    // let api = {
    //   getCodeReviewGroups: sinon.stub().resolves(() => sinon.stub().callArgWith(0, []))
    // }
    let api = {
      getCodeReviewGroups: () => {
        console.log("called getCodeReviewGroups");
        return {
          then: callback => {callback([]);},
          // fail: () => {}
        } //sinon.stub().callArgWith(0, [])}}
      }
    }
    let wrapper = isolateComponent(
      <ManageCodeReviewGroups
        api={api}
      />
    )
    // wrapper.findOne(Button).props.onClick.simulate("click");
    // console.log(wrapper.debug());
  });
});

