import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedStandardsView as StandardsView} from '@cdo/apps/templates/sectionProgress/standards/StandardsView';

describe('StandardView', () => {
  let DEFAULT_PROPS;

  beforeEach(() => {
    DEFAULT_PROPS = {
      showStandardsIntroDialog: false,
      section: {
        id: 6,
        script: {
          id: 1163,
          name: 'express-2019',
          project_sharing: true
        },
        students: [],
        stageExtras: false
      },
      scriptData: {
        id: 1163,
        excludeCsfColumnInLegend: false,
        title: 'Express Course (2019)',
        path: '//localhost-studio.code.org:3000/s/express-2019',
        stages: []
      },
      scriptFriendlyName: 'Express Course (2019)'
    };
  });

  it('standards view shows StandardsIntroDialog', () => {
    const wrapper = shallow(
      <StandardsView {...DEFAULT_PROPS} showStandardsIntroDialog={true} />
    );
    expect(wrapper.find('Connect(StandardsIntroDialog)')).to.have.lengthOf(1);
  });

  it('standards view shows StandardsProgressTable', () => {
    const wrapper = shallow(
      <StandardsView {...DEFAULT_PROPS} showStandardsIntroDialog={true} />
    );
    expect(wrapper.find('Connect(StandardsProgressTable)')).to.have.lengthOf(1);
  });

  it('standards view shows StandardsLegend', () => {
    const wrapper = shallow(
      <StandardsView {...DEFAULT_PROPS} showStandardsIntroDialog={true} />
    );
    expect(wrapper.find('StandardsLegend')).to.have.lengthOf(1);
  });

  it('standards view shows additional information', () => {
    const wrapper = shallow(
      <StandardsView {...DEFAULT_PROPS} showStandardsIntroDialog={true} />
    );
    expect(wrapper.find('#test-how-to-standards')).to.have.lengthOf(1);
  });
});
