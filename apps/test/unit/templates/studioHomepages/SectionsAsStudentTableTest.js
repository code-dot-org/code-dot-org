import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import i18n from '@cdo/locale';
import {joinedSections} from './homepagesTestData';
import SectionsAsStudentTable from '@cdo/apps/templates/studioHomepages/SectionsAsStudentTable';
import {combineReducers, createStore} from 'redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';

describe('SectionsAsStudentTable', () => {
  const store = createStore(combineReducers({isRtl}));

  it('shows column headers for students', () => {
    const wrapper = shallow(
      <SectionsAsStudentTable sections={joinedSections} canLeave={false} />,
      {context: {store}}
    ).dive();
    [i18n.section(), i18n.course(), i18n.teacher(), i18n.sectionCode()].forEach(
      headerText => {
        expect(
          wrapper.containsMatchingElement(
            <td>
              <div>{headerText}</div>
            </td>
          )
        ).to.be.ok;
      }
    );
  });

  it('does not show a leave section button for teacher-managed student accounts', () => {
    const wrapper = shallow(
      <SectionsAsStudentTable sections={joinedSections} canLeave={false} />,
      {context: {store}}
    ).dive();
    expect(wrapper.find('Button').exists()).to.be.false;
  });

  it('shows a leave section button for students who do not have teacher-managed accounts', () => {
    const wrapper = shallow(
      <SectionsAsStudentTable sections={joinedSections} canLeave={true} />,
      {context: {store}}
    ).dive();
    expect(wrapper.find('Button').exists()).to.be.true;
  });

  it('renders a row for each joined section', () => {
    const wrapper = shallow(
      <SectionsAsStudentTable sections={joinedSections} canLeave={false} />,
      {context: {store}}
    ).dive();
    expect(wrapper.find('.test-row')).to.have.length(4);
    expect(wrapper.containsMatchingElement(<div>Current unit:</div>)).to.be.ok;
    joinedSections.forEach(section => {
      expect(
        wrapper.containsMatchingElement(
          <td>
            <div>{section.name}</div>
          </td>
        )
      ).to.be.ok;
      if (section.currentUnitTitle) {
        expect(
          wrapper.containsMatchingElement(
            <td>
              <a href={section.linkToAssigned}>{section.assignedTitle}</a>
              <div>
                <div>Current unit:</div>
                <a href={section.linkToCurrentUnit}>
                  {section.currentUnitTitle}
                </a>
              </div>
            </td>
          )
        ).to.be.ok;
      } else {
        expect(
          wrapper.containsMatchingElement(
            <td>
              <a href={section.linkToAssigned}>{section.assignedTitle}</a>
            </td>
          )
        ).to.be.ok;
      }
      expect(wrapper.containsMatchingElement(<td>{section.teacherName}</td>)).to
        .be.ok;
    });
  });
});
