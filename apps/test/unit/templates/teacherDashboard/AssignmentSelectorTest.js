import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {assert, expect} from '../../../util/deprecatedChai';
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
      84: {
        id: 84,
        version_year: '2017',
        display_name: '2017',
        is_stable: true,
        is_recommended: false,
        locales: ['العربية', 'Čeština', 'Deutsch', 'English'],
        units: {1: {id: 94, name: 'Unit 1'}}
      },
      85: {
        id: 85,
        version_year: '2018',
        display_name: '2018',
        is_stable: true,
        is_recommended: true,
        locales: ['English', 'Italiano', 'Slovenčina'],
        units: {
          95: {
            id: 95,
            name: 'Course A (2018)'
          }
        }
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
    unitId: null,
    courseId: null,
    scriptId: null
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
    courseOfferingId: null,
    courseVersionId: null,
    unitId: 36,
    courseId: null,
    scriptId: 36
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
      .simulate('change', {target: {value: 'csd'}});
    assert.equal(wrapper.find('select').length, 2);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseOfferingId: null,
      courseVersionId: null,
      unitId: null
    });
  });

  it('second dropdown defaults to current value when section is provided', () => {
    const wrapper = shallow(
      <AssignmentSelector
        {...defaultProps}
        section={{
          ...defaultProps.section,
          courseOfferingId: 1, // CS Discoveries
          courseVersionId: 10,
          unitId: 168 // Unit 1: Problem Solving
        }}
      />
    );
    assert.equal(wrapper.find('select').length, 2);
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseOfferingId: 1,
      courseVersionId: 10,
      unitId: 168
    });
  });

  it('does not show script that is in course in primary dropdown', () => {
    const wrapper = shallow(<AssignmentSelector {...defaultProps} />);
    assert.equal(wrapper.find('select').length, 1);
    assert.equal(wrapper.find('option').length, 3);
    assert.equal(
      wrapper
        .find('option')
        .at(0)
        .text(),
      ''
    );
    assert.equal(
      wrapper
        .find('option')
        .at(1)
        .text(),
      'CS Discoveries'
    );
    assert.equal(
      wrapper
        .find('option')
        .at(2)
        .text(),
      'Make a Flappy game'
    );
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseOfferingId: null,
      courseVersionId: null,
      unitId: null
    });
  });

  it('shows second dropdown after selecting primary', () => {
    const wrapper = shallow(<AssignmentSelector {...defaultProps} />);
    wrapper
      .find('select')
      .at(0)
      .simulate('change', {target: {value: 'csd'}});
    assert.equal(wrapper.find('select').length, 2);
    const secondary = wrapper.find('select').at(1);
    assert.equal(secondary.find('option').length, 2);
    assert.equal(
      secondary
        .find('option')
        .at(0)
        .text(),
      'Unit 1: Problem Solving'
    );
    assert.equal(
      secondary
        .find('option')
        .at(1)
        .text(),
      ''
    );
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
      .simulate('change', {target: {value: 'csd'}});
    wrapper
      .find('select')
      .at(1)
      .simulate('change', {target: {value: 'null_168'}});
    assert.deepEqual(wrapper.instance().getSelectedAssignment(), {
      courseOfferingId: null,
      courseVersionId: null,
      unitId: null
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

  it('includes uncoursed script if section is assigned that script currently', () => {
    // Eventually we don't expect this to be a plausible case, but until we do
    // our migration, it's possible for a section to be assigned to a script that
    // is in a course, and we want to make sure this still shows up in our
    // dropdown.
    const wrapper = shallow(
      <AssignmentSelector
        {...defaultProps}
        section={{
          ...defaultProps.section,
          courseOfferingId: null,
          courseVersionId: null,
          unitId: 168
        }}
      />
    );
    assert.equal(wrapper.find('select').length, 1);
    assert.equal(wrapper.find('option').length, 4);
    // ends up after flappy, because it's in a later category
    assert.equal(
      wrapper
        .find('option')
        .at(2)
        .text(),
      'Make a Flappy game'
    );
    assert.equal(
      wrapper
        .find('option')
        .at(3)
        .text(),
      'Unit 1: Problem Solving'
    );
  });

  // Make sure we are passing the proper recommended version to our child component, <AssignmentVersionSelector/>
  describe('version recommendation', () => {
    it('recommends the latest stable version supported in user locale', () => {
      // Choose the 'Make a flappy game' script, which has both 2017 and 2018 versions.
      // Make sure we are recommended 2017 version, which supports Spanish.
      const wrapper = shallow(
        <AssignmentSelector
          {...defaultProps}
          localeCode="es-MX"
          section={{
            ...defaultProps.section,
            courseOfferingId: null,
            courseVersionId: null,
            unitId: null
          }}
        />
      );

      const versionSelectorProps = wrapper
        .find('AssignmentVersionSelector')
        .props();

      assert.equal(versionSelectorProps.versions.length, 2);
      const recommendedVersion = versionSelectorProps.versions.find(
        v => v.isRecommended
      );
      assert.equal(recommendedVersion.title, '2017');
    });

    it('recommends the latest stable version if no versions are supported in user locale', () => {
      // Choose the 'Make a flappy game' script, which has both 2017 and 2018 versions.
      // Make sure we are recommended 2018 version, since no versions support Slovak.
      const wrapper = shallow(
        <AssignmentSelector
          {...defaultProps}
          localeCode="sk-SK"
          section={{
            ...defaultProps.section,
            courseOfferingId: null,
            courseVersionId: null,
            unitId: 6
          }}
        />
      );

      const versionSelectorProps = wrapper
        .find('AssignmentVersionSelector')
        .props();

      assert.equal(versionSelectorProps.versions.length, 2);
      const recommendedVersion = versionSelectorProps.versions.find(
        v => v.isRecommended
      );
      assert.equal(recommendedVersion.title, '2018');
    });
  });

  it('shows two dropdowns if section has a course selected', () => {
    const wrapper = shallow(
      <AssignmentSelector
        {...defaultProps}
        section={{
          ...defaultProps.section,
          courseOfferingId: null,
          courseVersionId: null,
          unitId: null
        }}
      />
    );
    assert.equal(wrapper.find('select').length, 2);
  });

  it('shows two dropdowns if section has course and current unit selected', () => {
    const wrapper = shallow(
      <AssignmentSelector
        {...defaultProps}
        section={{
          ...defaultProps.section,
          courseOfferingId: null,
          courseVersionId: null,
          unitId: null
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
      assert.equal(wrapper.find('option').length, 4);
      assert.equal(
        wrapper
          .find('option')
          .at(0)
          .text(),
        ''
      );
      assert.equal(
        wrapper
          .find('option')
          .at(1)
          .text(),
        'Decide later'
      );
      assert.equal(
        wrapper
          .find('option')
          .at(2)
          .text(),
        'CS Discoveries'
      );
      assert.equal(
        wrapper
          .find('option')
          .at(3)
          .text(),
        'Make a Flappy game'
      );
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
        .simulate('change', {target: {value: 'csd'}});
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
        .simulate('change', {target: {value: 'csd'}});
      spy.resetHistory();
      wrapper
        .find('select')
        .at(1)
        .simulate('change', {target: {value: 'null_168'}});
      expect(spy).to.have.been.calledOnce.and.to.have.been.calledWith({
        courseOfferingId: null,
        courseVersionId: null,
        unitId: null
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
      expect(firstDropdown).to.have.prop('disabled', true);
    });

    it('disables the secondary dropdown', () => {
      wrapper
        .find('select')
        .at(0)
        .simulate('change', {target: {value: 'csd'}});
      const secondDropdown = wrapper.find('select').at(1);
      expect(secondDropdown).to.have.prop('disabled', true);
    });
  });
});
