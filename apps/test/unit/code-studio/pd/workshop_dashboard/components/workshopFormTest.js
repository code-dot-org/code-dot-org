import React from 'react';
import {shallow} from 'enzyme';
import {isolateComponent} from 'isolate-react';
import {expect, assert} from 'chai';
import {Factory} from 'rosie';
import {FormControl} from 'react-bootstrap';
import Permission, {
  WorkshopAdmin,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/permission';
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

  it('CSP and CSA virtual field disabled for non-ws-admin if within a month of starting', () => {
    const csp_in_person_ws = Factory.build('workshop_csp_in_person');
    const wrapper = isolateComponent(
      <WorkshopForm
        permission={new Permission(WorkshopAdmin)}
        facilitatorCourses={[]}
        workshop={csp_in_person_ws}
        onSaved={() => {}}
        readOnly={false}
      />,
      {context: {router: {}}}
    );

    // NEED TO MAKE THE SESSION START WITHIN A MONTH THEN THIS SHOULD PASS

    const virtualFormControl = wrapper.findOne('SelectIsVirtual');
    expect(virtualFormControl.props.readOnly).to.equal(true);
  });
});
