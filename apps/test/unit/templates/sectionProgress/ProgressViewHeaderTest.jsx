import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedProgressViewHeader as ProgressViewHeader} from '@cdo/apps/templates/sectionProgress/ProgressViewHeader';

describe('ProgressViewHeader', () => {
  let DEFAULT_PROPS = {
    scriptId: 132,
    sectionId: 6,
    currentView: 'summary',
    unitData: {
      id: 132,
      excludeCsfColumnInLegend: true,
      title: 'CSD Unit 1 - Problem Solving and Computing (19-20)',
      path: '//localhost-studio.code.org:3000/s/csd1-2019',
      lessons: [],
      version_year: '2019',
      family_name: 'csd-1',
    },
    scriptFriendlyName: "CSD Unit 1 - Problem Solving and Computing ('19-'20)",
  };

  it('show buttons when in standards view', () => {
    const wrapper = shallow(
      <ProgressViewHeader {...DEFAULT_PROPS} currentView={'standards'} />
    );
    expect(
      wrapper.find('Connect(StandardsViewHeaderButtons)')
    ).to.have.lengthOf(1);
  });

  it('does not show buttons when in standards view', () => {
    const wrapper = shallow(<ProgressViewHeader {...DEFAULT_PROPS} />);
    expect(
      wrapper.find('Connect(StandardsViewHeaderButtons)')
    ).to.have.lengthOf(0);
  });
});
