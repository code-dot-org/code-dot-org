import { assert } from '../../../util/configuredChai';
import { throwOnConsoleErrors, throwOnConsoleWarnings } from '../../../util/testUtils';
import React from 'react';
import { shallow } from 'enzyme';
import {
  UnconnectedSectionRow as SectionRow,
  EditOrDelete,
  ConfirmDelete,
  ConfirmSave
} from '@cdo/apps/templates/teacherDashboard/SectionRow';

const section = {
  id: 11,
  courseId: 29,
  scriptId: null,
  name: "my_section",
  loginType: "word",
  grade: "3",
  stageExtras: false,
  pairingAllowed: true,
  studentNames: ['joe', 'bob', 'tim', 'mary', 'jane', 'jen', 'john', 'tam', 'chris', 'lisa'],
  code: "PMTKVH",
  assignmentName: "CS Discoveries",
  assignmentPath: "//localhost-studio.code.org:3000/courses/csd"
};
const validLoginTypes = ['word', 'email', 'picture'];
const validGrades = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "Other"];

const defaultProps = {
  sectionId: 11,
  validLoginTypes,
  validGrades,
  validAssignments: {},
  section,
  updateSection: () => {},
  removeSection: () => {},
};

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
  });

  describe('login type column', () => {
    it('has text when not editing', () => {
      const wrapper = shallow(
        <SectionRow {...defaultProps}/>
      );
      const col = wrapper.find('td').at(1);
      assert.equal(col.text(), 'word');
    });

    it('has a dropdown when editing', () => {
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
    it('has text when not editing', () => {
      const wrapper = shallow(
        <SectionRow {...defaultProps}/>
      );
      const col = wrapper.find('td').at(2);
      assert.equal(col.text(), '3');
    });

    it('has a dropdown when editing', () => {
      const wrapper = shallow(
        <SectionRow {...defaultProps}/>
      );
      wrapper.setState({editing: true});
      const col = wrapper.find('td').at(2);

      assert.equal(col.find('select').length, 1);
      assert.equal(col.find('select').props().defaultValue, '3');
      assert.equal(col.find('option').length, validGrades.length + 1);
    });
  });

  describe('course column', () => {
    it('has a link when not editing', () => {
      const wrapper = shallow(
        <SectionRow {...defaultProps}/>
      );
      const col = wrapper.find('td').at(3);
      assert.equal(col.find('a').length, 1);
      assert.equal(col.find('a').props().href, section.assignmentPath);
      assert.equal(col.find('a').text(), 'CS Discoveries');
    });

    it('has an AssignmentSelector when editing', () => {
      const wrapper = shallow(
        <SectionRow {...defaultProps}/>
      );
      wrapper.setState({editing: true});
      const col = wrapper.find('td').at(3);

      assert.equal(col.find('AssignmentSelector').length, 1);
    });
  });

  describe('stageExtras column', () => {
    it('has text when not editing', () => {
      const wrapper = shallow(
        <SectionRow {...defaultProps}/>
      );
      const col = wrapper.find('td').at(4);
      assert.equal(col.text(), 'No');
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

  describe('buttons column', () => {
    it('shows EditOrDelete by default', () => {
      const wrapper = shallow(
        <SectionRow {...defaultProps}/>
      );
      const col = wrapper.find('td').at(8);
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

        assert.equal(wrapper.find('ProgressButton').length, 2);
        assert.equal(wrapper.find('ProgressButton').at(0).props().text, 'Edit');
        assert.equal(wrapper.find('ProgressButton').at(1).props().text, 'Delete');
      });

      it('has one button if canDelete is false', () => {
        const wrapper = shallow(
          <EditOrDelete
            canDelete={false}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        );

        assert.equal(wrapper.find('ProgressButton').length, 1);
        assert.equal(wrapper.find('ProgressButton').at(0).props().text, 'Edit');
      });
    });

    it('shows ConfirmSave when editing', () => {
      const wrapper = shallow(
        <SectionRow {...defaultProps}/>
      );
      wrapper.setState({editing: true});
      const col = wrapper.find('td').at(8);
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

        assert.equal(wrapper.find('ProgressButton').length, 2);
        assert.equal(wrapper.find('ProgressButton').at(0).props().text, 'Save');
        assert.equal(wrapper.find('ProgressButton').at(1).props().text, 'Cancel');
      });
    });

    it('shows ConfirmDelete when deleting', () => {
      const wrapper = shallow(
        <SectionRow {...defaultProps}/>
      );
      wrapper.setState({deleting: true});
      const col = wrapper.find('td').at(8);
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
        assert.equal(wrapper.find('ProgressButton').length, 2);
        assert.equal(wrapper.find('ProgressButton').at(0).props().text, 'Yes');
        assert.equal(wrapper.find('ProgressButton').at(1).props().text, 'No');
      });
    });
  });
});
