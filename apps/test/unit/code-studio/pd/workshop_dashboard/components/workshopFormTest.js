import React from 'react';
import {shallow} from 'enzyme';
import {assert} from 'chai';
import {Factory} from 'rosie';
import {FormControl} from 'react-bootstrap';
import Permission from '@cdo/apps/code-studio/pd/workshop_dashboard/permission';
import {WorkshopForm} from '@cdo/apps/code-studio/pd/workshop_dashboard/components/workshop_form';
import '../workshopFactory';

describe('WorkshopForm test', () => {
  let fakeWorkshop;

  beforeEach(() => {
    fakeWorkshop = Factory.build('workshop');
  });

  it('renders csf intro workshop', () => {
    const wrapper = shallow(
      <WorkshopForm
        permission={new Permission()}
        facilitatorCourses={[]}
        workshop={fakeWorkshop}
        onSaved={() => {}}
        readOnly={false}
      />,
      {context: {router: {}}}
    );

    const someControl = wrapper.find(FormControl);
    assert(someControl.exists());
  });

  it('renders csp summer workshop', () => {
    const cspSummerWorkshop = Factory.build('csp summer workshop');
    const wrapper = shallow(
      <WorkshopForm
        permission={new Permission()}
        facilitatorCourses={[]}
        workshop={cspSummerWorkshop}
        onSaved={() => {}}
        readOnly={false}
      />,
      {context: {router: {}}}
    );

    const someControl = wrapper.find(FormControl);
    assert(someControl.exists());
  });
});
