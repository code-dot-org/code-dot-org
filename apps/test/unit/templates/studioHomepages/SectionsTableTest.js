import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import i18n from '@cdo/locale';
import {joinedSections} from './homepagesTestData';
import SectionsTable from '@cdo/apps/templates/studioHomepages/SectionsTable';

describe('SectionsTable', () => {

  it('shows column headers for students with teacher-managed accounts', () => {
    const wrapper = shallow(
      <SectionsTable
        sections={joinedSections}
        isRtl={false}
        isTeacher={false}
        canLeave={false}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <td>
        <div>
          {i18n.section()}
        </div>
      </td>
    );
    expect(wrapper).to.containMatchingElement(
      <td>
        <div>
          {i18n.course()}
        </div>
      </td>
    );
    expect(wrapper).to.containMatchingElement(
      <td>
        <div>
          {i18n.teacher()}
        </div>
      </td>
    );
    expect(wrapper).to.containMatchingElement(
      <td>
        <div>
          {i18n.sectionCode()}
        </div>
      </td>
    );
    // Students with teacher-managed accounts should not see a button to leave the section.
    expect(wrapper.find('Button').exists()).to.be.false;
  });

  it('shows column headers for students who do not have teacher-managed accounts', () => {
    const wrapper = shallow(
      <SectionsTable
        sections={joinedSections}
        isRtl={false}
        isTeacher={false}
        canLeave={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <td>
        <div>
          {i18n.section()}
        </div>
      </td>
    );
    expect(wrapper).to.containMatchingElement(
      <td>
        <div>
          {i18n.course()}
        </div>
      </td>
    );
    expect(wrapper).to.containMatchingElement(
      <td>
        <div>
          {i18n.teacher()}
        </div>
      </td>
    );
    expect(wrapper).to.containMatchingElement(
      <td>
        <div>
          {i18n.sectionCode()}
        </div>
      </td>
    );
    // Students who do not have teacher-managed accounts should see a button to leave the section.
    expect(wrapper.find('Button').exists()).to.be.true;
  });

  it('shows column headers for students teachers', () => {
    const wrapper = shallow(
      <SectionsTable
        sections={joinedSections}
        isRtl={false}
        isTeacher={true}
        canLeave={false}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <td>
        <div>
          {i18n.section()}
        </div>
      </td>
    );
    expect(wrapper).to.containMatchingElement(
      <td>
        <div>
          {i18n.course()}
        </div>
      </td>
    );
    expect(wrapper).to.containMatchingElement(
      <td>
        <div>
          {i18n.students()}
        </div>
      </td>
    );
    expect(wrapper).to.containMatchingElement(
      <td>
        <div>
          {i18n.sectionCode()}
        </div>
      </td>
    );
    // Teachers can't be students in their own sections, therefore do not see a button to leave the section.
    expect(wrapper.find('Button').exists()).to.be.false;
  });

  it('renders a row for each joined section', () => {
    const wrapper = shallow(
      <SectionsTable
        sections={joinedSections}
        isRtl={false}
        isTeacher={false}
        canLeave={false}
      />
    );
    const randomJoinedSectionIndex = Math.floor(Math.random() * 4);
    expect(wrapper.find('.row')).to.have.length(4);
    expect(wrapper).to.containMatchingElement(
      <td>
        <div>
          {joinedSections[randomJoinedSectionIndex].name}
        </div>
      </td>
    );
    expect(wrapper).to.containMatchingElement(
      <td>
        <a>
          {joinedSections[randomJoinedSectionIndex].assignedTitle}
        </a>
      </td>
    );
    expect(wrapper).to.containMatchingElement(
      <td>
        {joinedSections[randomJoinedSectionIndex].teacherName}
      </td>
    );
  });
});
