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
      <PrimaryTeacher primaryTeacher={testPrimaryTeacher} numCoteachers={1} />
    );
    expect(wrapper.text()).to.include('Parmesan');
    expect(wrapper.text()).to.include('parmesan@code.org');
  });

  it('renders nothing if there are no coteachers', () => {
    const wrapper = shallow(
      <PrimaryTeacher primaryTeacher={testPrimaryTeacher} numCoteachers={0} />
    );
    expect(wrapper).to.be.empty;
  });

  it('renders nothing if coteachers are added', () => {
    let numCoteachers = 0;
    const wrapper = shallow(
      <PrimaryTeacher
        primaryTeacher={testPrimaryTeacher}
        numCoteachers={numCoteachers}
      />
    );
    expect(wrapper).to.be.empty;
    numCoteachers = 3;
    wrapper.update();

    expect(wrapper).to.be.empty;
  });
});
