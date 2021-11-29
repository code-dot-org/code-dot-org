import React from 'react';
import {Provider} from 'react-redux';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import i18n from '@cdo/locale';
import {joinedSections} from './homepagesTestData';
import SectionsAsStudentTable from '@cdo/apps/templates/studioHomepages/SectionsAsStudentTable';
import {combineReducers, createStore} from 'redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';

const store = createStore(combineReducers({isRtl}));

function wrapped(element) {
  return mount(<Provider store={store}>{element}</Provider>);
}

describe('SectionsAsStudentTable', () => {
  it('shows column headers for students', () => {
    const wrapper = wrapped(
      <SectionsAsStudentTable sections={joinedSections} canLeave={false} />
    );
    [i18n.section(), i18n.course(), i18n.teacher(), i18n.sectionCode()].forEach(
      headerText => {
        expect(
          wrapper.containsMatchingElement(
            <td>
              <div>{headerText}</div>
            </td>
          )
        );
      }
    );
  });

  it('does not show a leave section button for teacher-managed student accounts', () => {
    const wrapper = wrapped(
      <SectionsAsStudentTable sections={joinedSections} canLeave={false} />
    );
    expect(wrapper.find('Button').exists()).to.be.false;
  });

  it('shows a leave section button for students who do not have teacher-managed accounts', () => {
    const wrapper = wrapped(
      <SectionsAsStudentTable sections={joinedSections} canLeave={true} />
    );
    expect(wrapper.find('Button').exists()).to.be.true;
  });

  it('renders a row for each joined section', () => {
    const wrapper = wrapped(
      <SectionsAsStudentTable sections={joinedSections} canLeave={false} />
    );
    expect(wrapper.find('.test-row')).to.have.length(4);
    expect(wrapper.containsMatchingElement(<div>Current unit:</div>));
    joinedSections.forEach(section => {
      expect(
        wrapper.containsMatchingElement(
          <td>
            <div>{section.name}</div>
          </td>
        )
      );
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
        );
      } else {
        expect(
          wrapper.containsMatchingElement(
            <td>
              <a href={section.linkToAssigned}>{section.assignedTitle}</a>
            </td>
          )
        );
      }
      expect(wrapper.containsMatchingElement(<td>{section.teacherName}</td>));
    });
  });

  it('shows section codes correctly', () => {
    const wrapper = wrapped(
      <SectionsAsStudentTable sections={joinedSections} canLeave={false} />
    );

    expect(wrapper.containsMatchingElement(<td>ClassOneCode</td>));
    expect(wrapper.containsMatchingElement(<td>ClassTwoCode</td>));
    expect(wrapper.containsMatchingElement(<td>Google Classroom</td>));
    expect(wrapper.containsMatchingElement(<td>DoNotShowThis</td>)).to.be.false;
    expect(wrapper.containsMatchingElement(<td>Clever</td>));
    expect(wrapper.containsMatchingElement(<td>OrThisEither</td>)).to.be.false;
  });
});
