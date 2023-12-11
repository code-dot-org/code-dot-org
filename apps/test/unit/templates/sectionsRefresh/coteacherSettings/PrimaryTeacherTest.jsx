import React from 'react';
import {mount, shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';

import PrimaryTeacher from '@cdo/apps/templates/sectionsRefresh/coteacherSettings/PrimaryTeacher';

const testPrimaryTeacher = {
  name: 'Parmesan',
  email: 'parmesan@code.org',
};

describe('PrimaryTeacher', () => {
  it('renders the primary teacher if there are coteachers', () => {
    const wrapper = mount(
      <PrimaryTeacher
        primaryTeacher={testPrimaryTeacher}
        coteachersExist={true}
      />
    );
    expect(wrapper.text()).to.include('Parmesan');
    expect(wrapper.text()).to.include('parmesan@code.org');
  });

  it('renders nothing if there are no coteachers', () => {
    const wrapper = shallow(
      <PrimaryTeacher
        primaryTeacher={testPrimaryTeacher}
        coteachersExist={false}
      />
    );
    expect(wrapper).to.be.empty;
  });

  it('renders nothing if coteachers are added', () => {
    let coteachersExist = false;
    const wrapper = shallow(
      <PrimaryTeacher
        primaryTeacher={testPrimaryTeacher}
        coteachersExist={coteachersExist}
      />
    );
    expect(wrapper).to.be.empty;
    coteachersExist = true;
    wrapper.update();

    expect(wrapper).to.be.empty;
  });
});
