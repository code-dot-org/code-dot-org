import React from 'react';
import i18n from '@cdo/locale';
import {shallow} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import {UnconnectedTeacherDashboardHeader as TeacherDashboardHeader} from '@cdo/apps/templates/teacherDashboard/TeacherDashboardHeader';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const MOCK_SECTIONS = {
  1: {
    id: 1,
    name: 'intro to computer science I'
  },
  2: {
    id: 2,
    name: 'intro to computer science II'
  },
  3: {
    id: 3,
    name: 'hidden section',
    hidden: true
  }
};

const MOCK_SCRIPT = {
  name: 'Course D (2019)'
};

const DEFAULT_PROPS = {
  sections: MOCK_SECTIONS,
  selectedSectionId: 1,
  assignmentName: MOCK_SCRIPT.name,
  openEditSectionDialog: () => {}
};

describe('TeacherDashboardHeader', () => {
  it('renders section name in header', () => {
    const wrapper = shallow(<TeacherDashboardHeader {...DEFAULT_PROPS} />);
    let h1Elements = wrapper.find('h1');
    expect(h1Elements).to.have.lengthOf(1);
    expect(h1Elements.contains('intro to computer science I')).to.equal(true);
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

  it('renders dropdown button with links to sections, highlighting current section, ignoring hidden section', () => {
    const wrapper = shallow(<TeacherDashboardHeader {...DEFAULT_PROPS} />);
    let dropdownButton = wrapper.find('DropdownButton');
    expect(dropdownButton).to.have.lengthOf(1);

    let dropdownLinks = dropdownButton.find('a');
    expect(dropdownLinks).to.have.lengthOf(2);

    let checkmarkIcon = <FontAwesome icon="check" />;
    expect(
      dropdownLinks.at(0).contains('intro to computer science I')
    ).to.equal(true);
    expect(dropdownLinks.at(0).contains(checkmarkIcon)).to.equal(true);

    expect(
      dropdownLinks.at(1).contains('intro to computer science II')
    ).to.equal(true);
    expect(dropdownLinks.at(1).contains(checkmarkIcon)).to.equal(false);
  });

  it('renders button to edit section details', () => {
    const wrapper = shallow(<TeacherDashboardHeader {...DEFAULT_PROPS} />);
    let editSectionButton = wrapper.findWhere(
      element =>
        element.is('Button') &&
        element.prop('text') === i18n.editSectionDetails()
    );
    expect(editSectionButton).to.have.lengthOf(1);
    expect(wrapper.find('Connect(EditSectionDialog)')).to.have.lengthOf(1);
  });
});
