import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {assert, expect} from '../../../util/reconfiguredChai';
import AssignmentSelector from '@cdo/apps/templates/teacherDashboard/AssignmentSelector';

const courseOfferings = {
  1: {
    id: 1,
    display_name: 'Course A',
    category: 'csf',
    is_featured: false,
    course_versions: {
      1: {
        id: 1,
        version_year: '2017',
        display_name: '2017',
        is_stable: true,
        is_recommended: false,
        locales: ['العربية', 'Čeština', 'Deutsch', 'English'],
        units: {1: {id: 1, name: 'Course A'}}
      },
      2: {
        id: 2,
        version_year: '2018',
        display_name: '2018',
        is_stable: true,
        is_recommended: true,
        locales: ['English', 'Italiano', 'Slovenčina'],
        units: {
          2: {
            id: 2,
            name: 'Course A (2018)'
          }
        }
      }
    }
  },
  2: {
    id: 2,
    display_name: 'Computer Science Discoveries',
    category: 'full_course',
    is_featured: false,
    course_versions: {
      3: {
        id: 3,
        version_year: '2017',
        display_name: '2017',
        is_stable: true,
        is_recommended: false,
        locales: [],
        units: {3: {id: 3, name: 'Unit 1'}, 4: {id: 4, name: 'Unit 2'}}
      },
      4: {
        id: 3,
        version_year: '2018',
        display_name: '2018',
        is_stable: true,
        is_recommended: true,
        locales: [],
        units: {5: {id: 5, name: 'Unit 1'}, 6: {id: 6, name: 'Unit 2'}}
      }
    }
  },
  3: {
    id: 3,
    display_name: 'Computer Science A',
    category: 'full_course',
    is_featured: false,
    course_versions: {
      5: {
        id: 5,
        version_year: '2022',
        display_name: '2022',
        is_stable: true,
        is_recommended: false,
        locales: [],
        units: {7: {id: 7, name: 'Unit 1'}, 8: {id: 8, name: 'Unit 2'}}
      }
    }
  },
  4: {
    id: 4,
    display_name: 'Flappy',
    category: 'hoc',
    is_featured: false,
    course_versions: {
      6: {
        id: 6,
        version_year: 'unversioned',
        display_name: 'unversioned',
        is_stable: true,
        is_recommended: false,
        locales: [],
        units: {9: {id: 9, name: 'Flappy'}}
      }
    }
  },
  5: {
    id: 5,
    display_name: 'Hello World',
    category: 'hoc',
    is_featured: true,
    course_versions: {
      7: {
        id: 7,
        version_year: 'unversioned',
        display_name: 'unversioned',
        is_stable: true,
        is_recommended: true,
        locales: [],
        units: {10: {id: 10, name: 'Hello World'}}
      }
    }
  },
  6: {
    id: 6,
    display_name: 'Poem Art',
    category: 'hoc',
    is_featured: true,
    course_versions: {
      8: {
        id: 8,
        version_year: 'unversioned',
        display_name: 'unversioned',
        is_stable: true,
        is_recommended: true,
        locales: [],
        units: {11: {id: 11, name: 'Poem Art'}}
      }
    }
  },
  7: {
    id: 7,
    display_name: 'Artist',
    category: 'hoc',
    is_featured: false,
    course_versions: {
      9: {
        id: 9,
        version_year: 'unversioned',
        display_name: 'unversioned',
        is_stable: true,
        is_recommended: true,
        locales: [],
        units: {12: {id: 12, name: 'Artist'}}
      }
    }
  }
};

const defaultProps = {
  localeCode: 'en-US',
  courseOfferings: courseOfferings,
  section: {
    id: 11,
    name: 'foo',
    loginType: 'email',
    providerManaged: false,
    lessonExtras: false,
    ttsAutoplayEnabled: false,
    pairingAllowed: false,
    studentCount: 0,
    code: 'asdf',
    courseOfferingId: null,
    courseVersionId: null,
    unitId: null
  }
};

const hiddenSectionProps = {
  courseOfferings: courseOfferings,
  section: {
    id: 11,
    name: 'foo',
    loginType: 'email',
    providerManaged: false,
    lessonExtras: false,
    ttsAutoplayEnabled: false,
    pairingAllowed: false,
    studentCount: 0,
    code: 'asdf',
    courseOfferingId: 2,
    courseVersionId: 4,
    unitId: 6
  }
};

describe('AssignmentSelector', () => {
  it('defaults to one dropdown, no selection when no section is provided', () => {
    const wrapper = shallow(
      <AssignmentSelector {...defaultProps} section={null} />
    );
    assert.equal(wrapper.find('select').length, 1);
    assert.equal(wrapper.find('select').value, undefined);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseOfferingId: null,
      courseVersionId: null,
      unitId: null
    });
  });

  it('second dropdown defaults to no selection when no section is provided', () => {
    const wrapper = shallow(
      <AssignmentSelector {...defaultProps} section={null} />
    );
    wrapper
      .find('select')
      .at(0)
      .simulate('change', {target: {value: 2}});
    assert.equal(wrapper.find('select').length, 2);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseOfferingId: 2,
      courseVersionId: 3,
      unitId: 5
    });
  });

  it('second dropdown defaults to current value when section is provided', () => {
    const wrapper = shallow(
      <AssignmentSelector
        {...defaultProps}
        section={{
          ...defaultProps.section,
          courseOfferingId: 2,
          courseVersionId: 4,
          unitId: 6
        }}
      />
    );
    assert.equal(wrapper.find('select').length, 2);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseOfferingId: 2,
      courseVersionId: 4,
      unitId: 6
    });
  });

  it('shows all course offerings in first dropdown with blank option', () => {
    const wrapper = shallow(<AssignmentSelector {...defaultProps} />);
    assert.equal(wrapper.find('select').length, 1);
    assert.equal(wrapper.find('option').length, 8);

    assert.equal(wrapper.find('option').map(option => option.text()), [
      '',
      'Computer Science A',
      'Computer Science Discoveries',
      'Course A',
      'Hello World',
      'Poem Art',
      'Artist',
      'Flappy'
    ]);
  });

  it('shows second dropdown after selecting primary', () => {
    const wrapper = shallow(<AssignmentSelector {...defaultProps} />);
    wrapper
      .find('select')
      .at(0)
      .simulate('change', {target: {value: 2}});
    assert.equal(wrapper.find('select').length, 2);
    const secondary = wrapper.find('select').at(1);
    assert.equal(secondary.find('option').length, 3);
    assert.equal(secondary.find('option').map(option => option.text()), [
      'Unit 1',
      'Unit 2',
      ''
    ]);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseOfferingId: null,
      courseVersionId: null,
      unitId: null
    });
  });

  it('can select script in second dropdown after selecting primary', () => {
    const wrapper = shallow(<AssignmentSelector {...defaultProps} />);
    wrapper
      .find('select')
      .at(0)
      .simulate('change', {target: {value: 2}});
    wrapper
      .find('select')
      .at(1)
      .simulate('change', {target: {value: 3}});
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseOfferingId: 2,
      courseVersionId: 3,
      unitId: 3
    });
  });

  it('hides second dropdown after selecting "" primary', () => {
    const wrapper = shallow(<AssignmentSelector {...defaultProps} />);
    wrapper
      .find('select')
      .at(0)
      .simulate('change', {target: {value: 'csd'}});
    assert.equal(wrapper.find('select').length, 2);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseOfferingId: null,
      courseVersionId: null,
      unitId: null
    });

    wrapper
      .find('select')
      .at(0)
      .simulate('change', {target: {value: ''}});
    assert.equal(wrapper.find('select').length, 1);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseOfferingId: null,
      courseVersionId: null,
      unitId: null
    });
  });

  it('shows two dropdowns if section has course offering, course version and unit', () => {
    const wrapper = shallow(
      <AssignmentSelector
        {...defaultProps}
        section={{
          ...defaultProps.section,
          courseOfferingId: 2,
          courseVersionId: 3,
          unitId: 3
        }}
      />
    );
    assert.equal(wrapper.find('select').length, 2);
  });

  it('shows one dropdown, no selection when hidden script is selected', () => {
    const wrapper = shallow(
      <AssignmentSelector
        {...hiddenSectionProps}
        section={{
          ...hiddenSectionProps.section,
          courseOfferingId: null,
          courseVersionId: null,
          unitId: null
        }}
      />
    );
    assert.equal(wrapper.find('select').length, 1);
    assert.equal(wrapper.find('select').value, undefined);
  });

  describe('the "Decide later" option', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(
        <AssignmentSelector {...defaultProps} chooseLaterOption />
      );
    });

    it('shows up after the blank option and before the others', () => {
      assert.equal(wrapper.find('select').length, 1);
      assert.equal(wrapper.find('option').length, 9);
      assert.equal(wrapper.find('option').map(option => option.text()), [
        '',
        'Decide later',
        'Computer Science Discoveries',
        'Course A',
        'Hello World',
        'Poem Art',
        'Artist',
        'Flappy'
      ]);
    });

    it('means selecting nothing', () => {
      wrapper
        .find('select')
        .at(0)
        .simulate('change', {target: {value: '__decideLater__'}});
      assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
        courseOfferingId: null,
        courseVersionId: null,
        unitId: null
      });
    });
  });

  describe('the onChange prop', () => {
    let wrapper, spy;

    beforeEach(() => {
      spy = sinon.spy();
      wrapper = shallow(
        <AssignmentSelector {...defaultProps} onChange={spy} />
      );
    });

    it(`doesn't get called during construction`, () => {
      expect(spy).not.to.have.been.called;
    });

    it('gets called when primary dropdown changes', () => {
      wrapper
        .find('select')
        .at(0)
        .simulate('change', {target: {value: 2}});
      expect(spy).to.have.been.calledOnce.and.to.have.been.calledWith({
        courseOfferingId: null,
        courseVersionId: null,
        unitId: null
      });
    });

    it('gets called when secondary dropdown changes', () => {
      wrapper
        .find('select')
        .at(0)
        .simulate('change', {target: {value: 2}});
      spy.resetHistory();
      wrapper
        .find('select')
        .at(1)
        .simulate('change', {target: {value: 3}});
      expect(spy).to.have.been.calledOnce.and.to.have.been.calledWith({
        courseOfferingId: 2,
        courseVersionId: 3,
        unitId: 3
      });
    });
  });

  describe('the disabled prop', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(<AssignmentSelector {...defaultProps} disabled />);
    });

    it('disables the primary dropdown', () => {
      const firstDropdown = wrapper.find('select').at(0);
      expect(firstDropdown.props().disabled).to.equal(true);
    });

    it('disables the secondary dropdown', () => {
      wrapper
        .find('select')
        .at(0)
        .simulate('change', {target: {value: 2}});
      const secondDropdown = wrapper.find('select').at(1);
      expect(secondDropdown.props().disabled).to.equal(true);
    });
  });
});
