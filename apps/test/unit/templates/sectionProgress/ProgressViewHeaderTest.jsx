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
      lessonExtras: false
    },
    currentView: 'summary',
    scriptData: {
      id: 132,
      excludeCsfColumnInLegend: true,
      title: 'CSD Unit 1 - Problem Solving and Computing (19-20)',
      path: '//localhost-studio.code.org:3000/s/csd1-2019',
      lessons: [],
      version_year: '2019',
      family_name: 'csd-1'
    },
    scriptFriendlyName: "CSD Unit 1 - Problem Solving and Computing ('19-'20)"
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

  it('displays a spinner when refreshing', () => {
    let headerProps = {...DEFAULT_PROPS, ...{refreshing: true}};
    const wrapper = shallow(<ProgressViewHeader {...headerProps} />);
    expect(wrapper.find('FontAwesome')).to.have.lengthOf(1);
  });
});
