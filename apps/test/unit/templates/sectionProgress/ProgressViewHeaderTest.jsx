import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedProgressViewHeader as ProgressViewHeader} from '@cdo/apps/templates/sectionProgress/ProgressViewHeader';

describe('ProgressViewHeader', () => {
  let DEFAULT_PROPS = {
    section: {
      id: 6,
      script: {
        id: 132,
        name: 'csd1-2019',
        project_sharing: true
      },
      students: [],
      stageExtras: false
    },
    currentView: 'summary',
    scriptData: {
      id: 132,
      excludeCsfColumnInLegend: true,
      title: 'CSD Unit 1 - Problem Solving and Computing (19-20)',
      path: '//localhost-studio.code.org:3000/s/csd1-2019',
      stages: []
    },
    scriptFriendlyName: "CSD Unit 1 - Problem Solving and Computing ('19-'20)"
  };

  it('show buttons when in standards view', () => {
    const wrapper = shallow(
      <ProgressViewHeader {...DEFAULT_PROPS} currentView={'standards'} />
    );
    expect(wrapper.find('StandardsViewHeaderButtons')).to.have.lengthOf(1);
  });
  it('does not show buttons when in standards view', () => {
    const wrapper = shallow(<ProgressViewHeader {...DEFAULT_PROPS} />);
    expect(wrapper.find('StandardsViewHeaderButtons')).to.have.lengthOf(0);
  });
});
