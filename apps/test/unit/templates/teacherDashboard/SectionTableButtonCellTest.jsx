import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import {
  UnconnectedSectionTableButtonCell as SectionTableButtonCell,
  EditOrDelete,
  ConfirmDelete,
} from '@cdo/apps/templates/teacherDashboard/SectionTableButtonCell';

describe('SectionTableButtonCell', () => {
  const section = {
    id: 1,
    name: 'sectionA',
    studentCount: 3,
    code: 'ABC',
    courseId: 29,
    scriptId: 168,
    grade: '5',
    providerManaged: false,
    assignmentName: ['CS Discoveries', 'Unit 1: Problem Solving'],
    assignmentPaths: ['//localhost-studio.code.org:3000/courses/csd', '//localhost-studio.code.org:3000/s/csd1']
  };

  it('shows EditOrDelete by default', () => {
    const wrapper = shallow(
      <SectionTableButtonCell sectionData={section}/>
    );
    assert.equal(wrapper.children().at(0).name(), 'EditOrDelete');
    assert.equal(wrapper.find('EditOrDelete').props().canDelete, false);
    assert.equal(wrapper.children().at(1).name(), 'PrintCertificates');
  });

  it('shows ConfirmDelete when deleting', () => {
    const wrapper = shallow(
      <SectionTableButtonCell sectionData={section}/>
    );
    wrapper.setState({deleting: true});
    assert.equal(wrapper.children().length, 2);
    assert.equal(wrapper.children().at(0).name(), 'ConfirmDelete');
    assert.equal(wrapper.children().at(1).name(), 'PrintCertificates');
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
});
