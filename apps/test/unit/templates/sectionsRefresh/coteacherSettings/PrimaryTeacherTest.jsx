import {mount, shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

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
    expect(wrapper.text()).toContain('Parmesan');
    expect(wrapper.text()).toContain('parmesan@code.org');
  });

  it('renders nothing if there are no coteachers', () => {
    const wrapper = shallow(
      <PrimaryTeacher primaryTeacher={testPrimaryTeacher} numCoteachers={0} />
    );
    expect(Object.keys(wrapper)).toHaveLength(0);
  });

  it('renders nothing if coteachers are added', () => {
    let numCoteachers = 0;
    const wrapper = shallow(
      <PrimaryTeacher
        primaryTeacher={testPrimaryTeacher}
        numCoteachers={numCoteachers}
      />
    );
    expect(Object.keys(wrapper)).toHaveLength(0);
    numCoteachers = 3;
    wrapper.update();

    expect(Object.keys(wrapper)).toHaveLength(0);
  });
});
