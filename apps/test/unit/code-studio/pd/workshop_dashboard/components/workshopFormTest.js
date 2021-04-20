import React from 'react';
import {shallow} from 'enzyme';
import {assert, expect} from 'chai';
import {Factory} from 'rosie';
import {FormControl, FormGroup} from 'react-bootstrap';
import Permission from '@cdo/apps/code-studio/pd/workshop_dashboard/permission';
import {WorkshopForm} from '@cdo/apps/code-studio/pd/workshop_dashboard/components/workshop_form';
import '../workshopFactory';

describe('WorkshopForm test', () => {
  let fakeWorkshop;

  beforeEach(() => {
    fakeWorkshop = Factory.build('workshop');
  });

  it('renders', () => {
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

  it('displays "Location" for a non-virtual workshop', () => {
    fakeWorkshop.virtual = false;
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

    const locationGroup = wrapper.find('#location_name').closest(FormGroup);
    assert(locationGroup.exists());
    expect(locationGroup.html()).to.include('Location Name');
  });

  it('displays "Link to join" for a virtual workshop', () => {
    fakeWorkshop.virtual = true;
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

    const locationGroup = wrapper.find('#location_name').closest(FormGroup);
    assert(locationGroup.exists());
    expect(locationGroup.html()).to.include('Link to Join');
  });
});
