import React, {useState, useEffect} from 'react';
import ManageCodeReviewGroups from '@cdo/apps/templates/manageStudents/ManageCodeReviewGroups';
import sinon from 'sinon';
import {shallow, mount} from 'enzyme';
import Button from '@cdo/apps/templates/Button';

describe('ManageCodeReviewGroups', () => {

  // try with resolves and rejects
  it('first test', () => {
    let dataApi = {
      getCodeReviewGroups: sinon.stub().resolves([])
    }
    // let dataApi = {
    //   getCodeReviewGroups: () => {
    //     console.log("called getCodeReviewGroups");
    //     return {
    //       then: callback => {callback([]);},
    //       fail: () => {}
    //     } //sinon.stub().callArgWith(0, [])}}
    //   }
    // }
    let wrapper = mount(
      <ManageCodeReviewGroups
        api={dataApi}
      />
    )
    wrapper.find(Button).simulate("click");
    console.log(wrapper.debug());
  });
});

