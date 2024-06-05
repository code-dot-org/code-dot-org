import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import DropdownButton from '@cdo/apps/templates/DropdownButton';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {UnconnectedTeacherDashboardHeader as TeacherDashboardHeader} from '@cdo/apps/templates/teacherDashboard/TeacherDashboardHeader';
import i18n from '@cdo/locale';

import {expect} from '../../../util/reconfiguredChai';

// Note: The UnconnectedTeacherDashboadHeader assumes the sections it receives
// have already been filtered (to remove hidden sections) and sorted
const MOCK_SECTIONS = [
  {
    id: 3,
    name: 'intro to computer science III',
    lessonExtras: true,
    pairingAllowed: true,
    ttsAutoplayEnabled: false,
    studentCount: 5,
    code: 'VQGSJR',
    providerManaged: false,
  },
  {
    id: 2,
    name: 'intro to computer science II',
    lessonExtras: true,
    pairingAllowed: true,
    ttsAutoplayEnabled: false,
    studentCount: 4,
    code: 'TQGSJR',
    providerManaged: false,
  },
  {
    id: 1,
    name: 'intro to computer science I',
    lessonExtras: true,
    pairingAllowed: true,
    ttsAutoplayEnabled: false,
    studentCount: 6,
    code: 'XQGSJR',
    providerManaged: false,
  },
];

const MOCK_SCRIPT = {
  name: 'Course D (2019)',
};

const DEFAULT_PROPS = {
  sections: MOCK_SECTIONS,
  selectedSection: MOCK_SECTIONS[0],
  assignmentName: MOCK_SCRIPT.name,
  openEditSectionDialog: () => {},
  asyncLoadCourseOfferings: () => {},
};

describe('TeacherDashboardHeader', () => {
  it('renders section name in header', () => {
    const wrapper = shallow(<TeacherDashboardHeader {...DEFAULT_PROPS} />);
    let h1Elements = wrapper.find('h1');
    expect(h1Elements).to.have.lengthOf(1);
    expect(h1Elements.contains('intro to computer science III')).to.equal(true);
  });

  it('renders assigned script name if assigned', () => {
    const wrapper = shallow(<TeacherDashboardHeader {...DEFAULT_PROPS} />);
    expect(wrapper.find('#assignment-name')).to.have.lengthOf(1);
    expect(wrapper.contains('Course D (2019)')).to.equal(true);
  });

  it('does not render script name if not assigned', () => {
    const wrapper = shallow(
      <TeacherDashboardHeader {...DEFAULT_PROPS} assignmentName="" />
    );
    expect(wrapper.find('#assignment-name')).to.have.lengthOf(0);
    expect(wrapper.contains('Course D (2019)')).to.equal(false);
  });

  it('renders dropdown button with links to sections, highlighting current section', () => {
    const wrapper = shallow(<TeacherDashboardHeader {...DEFAULT_PROPS} />);
    let dropdownButton = wrapper.find(DropdownButton);
    expect(dropdownButton).to.have.lengthOf(1);

    let dropdownLinks = dropdownButton.find('a');
    expect(dropdownLinks).to.have.lengthOf(3);

    let checkmarkIcon = <FontAwesome icon="check" />;
    expect(
      dropdownLinks.at(0).contains('intro to computer science III')
    ).to.equal(true);
    expect(dropdownLinks.at(0).contains(checkmarkIcon)).to.equal(true);

    expect(
      dropdownLinks.at(1).contains('intro to computer science II')
    ).to.equal(true);
    expect(dropdownLinks.at(1).contains(checkmarkIcon)).to.equal(false);
  });

  it('renders button to edit section details in new section setup flow', () => {
    const wrapper = shallow(<TeacherDashboardHeader {...DEFAULT_PROPS} />);
    let editSectionButton = wrapper.findWhere(
      element =>
        element.is('Button') &&
        element.prop('text') === i18n.editSectionDetails() &&
        element.prop('href') === '/sections/3/edit'
    );
    expect(editSectionButton).to.have.lengthOf(1);
  });
});
