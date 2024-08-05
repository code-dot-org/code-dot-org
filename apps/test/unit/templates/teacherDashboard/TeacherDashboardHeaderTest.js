import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {reducers} from '@cdo/apps/applab/redux/applab';
import {registerReducers, restoreRedux, stubRedux} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import currentUser from '@cdo/apps/templates/currentUserRedux';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {UnconnectedTeacherDashboardHeader as TeacherDashboardHeader} from '@cdo/apps/templates/teacherDashboard/TeacherDashboardHeader';
import i18n from '@cdo/locale';

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
    courseDisplayName: 'Course D (2019)',
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
    courseDisplayName: 'Course A (2019)',
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
    courseDisplayName: 'Course B (2019)',
  },
];

const DEFAULT_PROPS = {
  sections: MOCK_SECTIONS,
  selectedSection: MOCK_SECTIONS[0],
  openEditSectionDialog: () => {},
};

describe('TeacherDashboardHeader', () => {
  beforeEach(() => {
    stubRedux();
    registerReducers(commonReducers);
    registerReducers(reducers);
    registerReducers({currentUser});
  });

  afterEach(() => {
    restoreRedux();
  });

  it('renders section name in header', () => {
    const wrapper = shallow(<TeacherDashboardHeader {...DEFAULT_PROPS} />);
    let h1Elements = wrapper.find('h1');
    expect(h1Elements).toHaveLength(1);
    expect(h1Elements.contains('intro to computer science III')).toBe(true);
  });

  it('renders assigned script name if assigned', () => {
    const wrapper = shallow(
      <TeacherDashboardHeader
        {...DEFAULT_PROPS}
        selectedSection={{...MOCK_SECTIONS[0], courseDisplayName: null}}
      />
    );
    expect(wrapper.find('#assignment-name')).toHaveLength(1);
    expect(wrapper.contains('Course D (2019)')).toBe(true);
  });

  it('does not render script name if not assigned', () => {
    const wrapper = shallow(
      <TeacherDashboardHeader {...DEFAULT_PROPS} assignmentName="" />
    );
    expect(wrapper.find('#assignment-name')).toHaveLength(0);
    expect(wrapper.contains('Course D (2019)')).toBe(false);
  });

  it('renders dropdown button with links to sections, highlighting current section', () => {
    const wrapper = shallow(<TeacherDashboardHeader {...DEFAULT_PROPS} />);
    let dropdownButton = wrapper.find(DropdownButton);
    expect(dropdownButton).toHaveLength(1);

    let dropdownLinks = dropdownButton.find('a');
    expect(dropdownLinks).toHaveLength(3);

    let checkmarkIcon = <FontAwesome icon="check" />;
    expect(dropdownLinks.at(0).contains('intro to computer science III')).toBe(
      true
    );
    expect(dropdownLinks.at(0).contains(checkmarkIcon)).toBe(true);

    expect(dropdownLinks.at(1).contains('intro to computer science II')).toBe(
      true
    );
    expect(dropdownLinks.at(1).contains(checkmarkIcon)).toBe(false);
  });

  it('renders button to edit section details in new section setup flow', () => {
    const wrapper = shallow(<TeacherDashboardHeader {...DEFAULT_PROPS} />);
    let editSectionButton = wrapper.findWhere(
      element =>
        element.is('Button') &&
        element.prop('text') === i18n.editSectionDetails() &&
        element.prop('href') === '/sections/3/edit'
    );
    expect(editSectionButton).toHaveLength(1);
  });
});
