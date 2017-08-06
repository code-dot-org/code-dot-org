import {assert, expect} from '../../../util/configuredChai';
import {
  throwOnConsoleErrors,
  throwOnConsoleWarnings
} from '../../../util/testUtils';
import React from 'react';
import {shallow} from 'enzyme';
import {
  UnconnectedSectionRow as SectionRow,
  EditOrDelete,
  ConfirmDelete,
  ConfirmSave
} from '@cdo/apps/templates/teacherDashboard/SectionRow';
import experiments, {SECTION_FLOW_2017} from '@cdo/apps/util/experiments';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

const sections = {
  11: {
    id: 11,
    courseId: 29,
    scriptId: null,
    name: "my_section",
    loginType: "word",
    grade: "3",
    providerManaged: false,
    stageExtras: false,
    pairingAllowed: true,
    studentCount: 10,
    code: "PMTKVH",
  },
  12: {
    id: 12,
    courseId: 29,
    scriptId: 168,
    name: "section_with_course_and_script",
    loginType: "google_classroom",
    grade: "3",
    providerManaged: true,
    stageExtras: false,
    pairingAllowed: true,
    studentCount: 0,
    code: "G-1234567",
  }
};
const validLoginTypes = ['word', 'email', 'picture'];
const validGrades = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "Other"];

const defaultProps = {
  sectionId: 11,
  lightRow: true,
  validLoginTypes,
  validGrades,
  validAssignments: {
    '29_null': {
      id: 29,
      name: "CS Discoveries",
      script_name: "csd",
      category: "Full Courses",
      position: 1,
      category_priority: 0,
      courseId: 29,
      scriptId: null,
      assignId: "29_null",
      path: '//localhost-studio.code.org:3000/courses/csd',
    },
    'null_168': {
      id: 168,
      name: "Unit 1: Problem Solving",
      script_name: "csd1",
      category: "CS Discoveries",
      position: 0,
      category_priority: 7,
      courseId: null,
      scriptId: 168,
      assignId: "null_168",
      path: "//localhost-studio.code.org:3000/s/csd1"
    },
  },
  primaryAssignmentIds: [],
  sections,
  updateSection: () => {},
  removeSection: () => {},
};

function withSectionFlow2017(block) {
  describe(`(${SECTION_FLOW_2017})`, () => {
    beforeEach(() => experiments.setEnabled(SECTION_FLOW_2017, true));
    afterEach(() => experiments.setEnabled(SECTION_FLOW_2017, false));
    block();
  });
}

describe('SectionRow', () => {
  throwOnConsoleErrors();
  throwOnConsoleWarnings();

  describe('name column', () => {
    it('has a link to the section when not editing', () => {
      const wrapper = shallow(
        <SectionRow {...defaultProps}/>
      );
      const col = wrapper.find('td').at(0);
      assert.equal(col.find('a').length, 1);
      assert.equal(col.find('a').props().href, '#/sections/11/');
    });

    it('has an input when editing', () => {
      const wrapper = shallow(
        <SectionRow {...defaultProps}/>
      );
      wrapper.setState({editing: true});
      const col = wrapper.find('td').at(0);

      assert.equal(col.find('input').length, 1);
      assert.equal(col.find('input').props().defaultValue, 'my_section');
    });

    withSectionFlow2017(() => {
      it('has a link to the section', () => {
        const wrapper = shallow(
          <SectionRow
            {...defaultProps}
          />
        );
        const col = wrapper.find('td').at(0);
        assert.equal(col.find('a').length, 1);
        assert.equal(col.find('a').props().href, pegasus('/teacher-dashboard#/sections/11/'));
      });
    });
  });

  describe('login type column', () => {
    it('has text when not editing', () => {
      const wrapper = shallow(
        <SectionRow {...defaultProps}/>
      );
      const col = wrapper.find('td').at(1);
      assert.equal(col.text(), 'word');
    });

    withSectionFlow2017(() => {
      it('does not exist', () => {
        const wrapper = shallow(<SectionRow {...defaultProps}/>);
        const col = wrapper.find('td').at(1);
        expect(col.text()).not.to.equal('word');
      });
    });

    it('has text when editing provider-managed section', () => {
      const wrapper = shallow(
        <SectionRow
          {...defaultProps}
          sectionId={12}
        />
      );
      const col = wrapper.find('td').at(1);
      assert.equal(col.text(), 'google_classroom');
    });

    it('has a dropdown when editing non-provider-managed section', () => {
      const wrapper = shallow(
        <SectionRow {...defaultProps}/>
      );
      wrapper.setState({editing: true});
      const col = wrapper.find('td').at(1);

      assert.equal(col.find('select').length, 1);
      assert.equal(col.find('select').props().defaultValue, 'word');
      assert.equal(col.find('option').length, 3);
    });
  });

  describe('grade column', () => {
    const tests = (columnIndex = 2) => {
      it('has text when not editing', () => {
        const wrapper = shallow(
          <SectionRow {...defaultProps}/>
        );
        const col = wrapper.find('td').at(columnIndex);
        assert.equal(col.text(), '3');
      });

      it('has a dropdown when editing', () => {
        const wrapper = shallow(
          <SectionRow {...defaultProps}/>
        );
        wrapper.setState({editing: true});
        const col = wrapper.find('td').at(columnIndex);

        assert.equal(col.find('select').length, 1);
        assert.equal(col.find('select').props().defaultValue, '3');
        assert.equal(col.find('option').length, validGrades.length + 1);
      });
    };

    tests();
    withSectionFlow2017(() => tests(1));
  });

  describe('course column', () => {
    const tests = (columnIndex = 3) => {
      it('has a link when not editing', () => {
        const wrapper = shallow(
          <SectionRow {...defaultProps}/>
        );
        const col = wrapper.find('td').at(columnIndex);
        assert.equal(col.find('a').length, 1);
        assert.equal(col.find('a').props().href, '//localhost-studio.code.org:3000/courses/csd');
        assert.equal(col.find('a').text(), 'CS Discoveries');
      });

      it('has links to both primary and secondary assignments when not editing', () => {
        const wrapper = shallow(
          <SectionRow
            {...defaultProps}
            sectionId={12}
          />
        );
        const col = wrapper.find('td').at(columnIndex);
        assert.equal(col.find('a').length, 2);
        assert.equal(col.find('a').at(0).props().href, '//localhost-studio.code.org:3000/courses/csd');
        assert.equal(col.find('a').at(1).props().href, '//localhost-studio.code.org:3000/s/csd1');
      });

      it('has an AssignmentSelector when editing', () => {
        const wrapper = shallow(
          <SectionRow {...defaultProps}/>
        );
        wrapper.setState({editing: true});
        const col = wrapper.find('td').at(columnIndex);

        assert.equal(col.find('AssignmentSelector').length, 1);
      });
    };

    tests();
    withSectionFlow2017(() => tests(2));
  });

  describe('stageExtras column', () => {
    it('has text when not editing', () => {
      const wrapper = shallow(
        <SectionRow {...defaultProps}/>
      );
      const col = wrapper.find('td').at(4);
      assert.equal(col.text(), 'No');
    });

    withSectionFlow2017(() => {
      it('does not exist', () => {
        const wrapper = shallow(<SectionRow {...defaultProps}/>);
        const col = wrapper.find('td').at(4);
        expect(col.text()).not.to.equal('No');
      });
    });

    it('has a checkbox when editing', () => {
      const wrapper = shallow(
        <SectionRow {...defaultProps}/>
      );
      wrapper.setState({editing: true});
      const col = wrapper.find('td').at(4);
      assert.equal(col.find('input').length, 1);
      assert.equal(col.find('input').props().defaultChecked, false);
    });
  });

  describe('pairingAllowed column', () => {
    it('has text when not editing', () => {
      const wrapper = shallow(
        <SectionRow {...defaultProps}/>
      );
      const col = wrapper.find('td').at(5);
      assert.equal(col.text(), 'Yes');
    });

    withSectionFlow2017(() => {
      it('does not exist', () => {
        const wrapper = shallow(<SectionRow {...defaultProps}/>);
        const col = wrapper.find('td').at(5);
        expect(col.text()).not.to.equal('Yes');
      });
    });

    it('has a checkbox when editing', () => {
      const wrapper = shallow(
        <SectionRow {...defaultProps}/>
      );
      wrapper.setState({editing: true});
      const col = wrapper.find('td').at(5);
      assert.equal(col.find('input').length, 1);
      assert.equal(col.find('input').props().defaultChecked, true);
    });
  });

  describe('students column', () => {
    it('has a link to manage the section students when not editing', () => {
      const wrapper = shallow(
        <SectionRow {...defaultProps}/>
      );
      const col = wrapper.find('td').at(6);
      assert.equal(col.find('a').length, 1);
      assert.equal(col.find('a').props().href, '#/sections/11/manage');
    });

    it('has a link to manage the section students when editing', () => {
      const wrapper = shallow(
        <SectionRow {...defaultProps}/>
      );
      wrapper.setState({editing: true});
      const col = wrapper.find('td').at(6);

      assert.equal(col.find('a').length, 1);
      assert.equal(col.find('a').props().href, '#/sections/11/manage');
    });

    describe(`(${SECTION_FLOW_2017})`, () => {
      beforeEach(() => experiments.setEnabled(SECTION_FLOW_2017, true));
      afterEach(() => experiments.setEnabled(SECTION_FLOW_2017, false));

      it('has a link to manage the section students', () => {
        const wrapper = shallow(
          <SectionRow
            {...defaultProps}
          />
        );
        const link = wrapper.find('td').at(3).find('a').first();
        assert.equal(link.prop('href'), pegasus('/teacher-dashboard#/sections/11/manage'));
      });
    });
  });

  describe('section code column', () => {
    const tests = (columnIndex = 7) => {
      it('shows the code when not provider-managed', () => {
        const wrapper = shallow(
          <SectionRow {...defaultProps}/>
        );
        const col = wrapper.find('td').at(columnIndex);
        assert.equal(col.text(), 'PMTKVH');
      });

      it('has no code when provider-managed', () => {
        const wrapper = shallow(
          <SectionRow
            {...defaultProps}
            sectionId={12}
          />
        );
        const component = wrapper.find('ProviderManagedSectionCode').dive();
        const div = component.find('div').at(0);
        assert.include(div.text(), 'None');
        assert.equal(div.prop('data-tip'), 'This section is managed by google_classroom. Add students there, then re-sync this section.');
      });

      it('is empty when editing', () => {
        const wrapper = shallow(
          <SectionRow {...defaultProps}/>
        );
        wrapper.setState({editing: true});
        const col = wrapper.find('td').at(columnIndex);
        assert.equal(col.text(), '');
      });
    };

    tests();
    withSectionFlow2017(() => tests(4));
  });

  describe('buttons column', () => {
    const tests = (columnIndex = 8) => {
      it('shows EditOrDelete by default', () => {
        const wrapper = shallow(
          <SectionRow {...defaultProps}/>
        );
        const col = wrapper.find('td').at(columnIndex);
        assert.equal(col.children().length, 2);
        assert.equal(col.children().at(0).name(), 'EditOrDelete');
        assert.equal(col.find('EditOrDelete').props().canDelete, false);
        assert.equal(col.children().at(1).name(), 'PrintCertificates');
      });

      describe('EditOrDelete', () => {
        it('has two buttons if canDelete is true', () => {
          const wrapper = shallow(
            <EditOrDelete
              canDelete={true}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          );

          assert.equal(wrapper.find('Button').length, 2);
          assert.equal(wrapper.find('Button').at(0).props().text, 'Edit');
          assert.equal(wrapper.find('Button').at(1).props().text, 'Delete');
        });

        it('has one button if canDelete is false', () => {
          const wrapper = shallow(
            <EditOrDelete
              canDelete={false}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          );

          assert.equal(wrapper.find('Button').length, 1);
          assert.equal(wrapper.find('Button').at(0).props().text, 'Edit');
        });
      });

      it('shows ConfirmSave when editing', () => {
        const wrapper = shallow(
          <SectionRow {...defaultProps}/>
        );
        wrapper.setState({editing: true});
        const col = wrapper.find('td').at(columnIndex);
        assert.equal(col.children().length, 2);
        assert.equal(col.children().at(0).name(), 'ConfirmSave');
        assert.equal(col.children().at(1).name(), 'PrintCertificates');
      });

      describe('ConfirmSave', () => {
        it('has two buttons', () => {
          const wrapper = shallow(
            <ConfirmSave
              onClickSave={() => {}}
              onCancel={() => {}}
            />
          );

          assert.equal(wrapper.find('Button').length, 2);
          assert.equal(wrapper.find('Button').at(0).props().text, 'Save');
          assert.equal(wrapper.find('Button').at(1).props().text, 'Cancel');
        });
      });

      it('shows ConfirmDelete when deleting', () => {
        const wrapper = shallow(
          <SectionRow {...defaultProps}/>
        );
        wrapper.setState({deleting: true});
        const col = wrapper.find('td').at(columnIndex);
        assert.equal(col.children().length, 2);
        assert.equal(col.children().at(0).name(), 'ConfirmDelete');
        assert.equal(col.children().at(1).name(), 'PrintCertificates');
      });

      describe('ConfirmDelete', () => {
        it('has text with two buttons', () => {
          const wrapper = shallow(
            <ConfirmDelete
              onClickYes={() => {}}
              onClickNo={() => {}}
            />
          );

          assert.equal(wrapper.childAt(0).text(), 'Delete?');
          assert.equal(wrapper.find('Button').length, 2);
          assert.equal(wrapper.find('Button').at(0).props().text, 'Yes');
          assert.equal(wrapper.find('Button').at(1).props().text, 'No');
        });
      });
    };

    tests();
    withSectionFlow2017(() => tests(5));
  });
});
