import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import i18n from '@cdo/locale';
import {joinedSections} from './homepagesTestData';
import SectionsAsStudentTable from '@cdo/apps/templates/studioHomepages/SectionsAsStudentTable';
import {combineReducers, createStore} from 'redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';

describe('SectionsAsStudentTable', () => {
  const store = createStore(combineReducers({isRtl}));

  it('shows column headers for students', () => {
    const wrapper = shallow(
      <SectionsAsStudentTable
        sections={joinedSections}
        canLeave={false}
      />, {context: {store}},
    ).dive();
    [
      i18n.section(),
      i18n.course(),
      i18n.teacher(),
      i18n.sectionCode(),
    ].forEach((headerText) => {
      expect(wrapper).to.containMatchingElement(
        <td>
          <div>
            {headerText}
          </div>
        </td>
      );
    });
  });

  it('does not show a leave section button for teacher-managed student accounts', () => {
    const wrapper = shallow(
      <SectionsAsStudentTable
        sections={joinedSections}
        canLeave={false}
      />, {context: {store}},
    ).dive();
    expect(wrapper.find('Button').exists()).to.be.false;
  });

  it('shows a leave section button for students who do not have teacher-managed accounts', () => {
    const wrapper = shallow(
      <SectionsAsStudentTable
        sections={joinedSections}
        canLeave={true}
      />, {context: {store}},
    ).dive();
    expect(wrapper.find('Button').exists()).to.be.true;
  });

  it('renders a row for each joined section', () => {
    const wrapper = shallow(
      <SectionsAsStudentTable
        sections={joinedSections}
        canLeave={false}
      />, {context: {store}},
    ).dive();
    expect(wrapper.find('.test-row')).to.have.length(4);
    expect(wrapper).to.containMatchingElement(<div>Current unit:</div>);
    joinedSections.forEach((section) => {
      expect(wrapper).to.containMatchingElement(
        <td>
          <div>
            {section.name}
          </div>
        </td>
      );
      if (section.currentUnitTitle) {
        expect(wrapper).to.containMatchingElement(
            <td>
              <a href={section.linkToAssigned}>
                {section.assignedTitle}
              </a>
              <div>
                <div>Current unit:</div>
                <a href={section.linkToCurrentUnit}>
                  {section.currentUnitTitle}
                </a>
              </div>
            </td>
        );
      } else {
        expect(wrapper).to.containMatchingElement(
          <td>
            <a href={section.linkToAssigned}>
              {section.assignedTitle}
            </a>
          </td>
        );
      }
      expect(wrapper).to.containMatchingElement(
        <td>
          {section.teacherName}
        </td>
      );
    });
  });
});
