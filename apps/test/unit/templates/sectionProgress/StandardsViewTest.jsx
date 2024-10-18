import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedStandardsView as StandardsView} from '@cdo/apps/templates/sectionProgress/standards/StandardsView';

describe('StandardView', () => {
  let DEFAULT_PROPS;

  beforeEach(() => {
    DEFAULT_PROPS = {
      showStandardsIntroDialog: false,
      sectionId: 6,
      scriptData: {
        id: 1163,
        excludeCsfColumnInLegend: false,
        title: 'Express Course (2019)',
        path: '//studio.code.org.localhost:3000/s/express-2019',
        lessons: [],
      },
      scriptFriendlyName: 'Express Course (2019)',
    };
  });

  it('standards view shows StandardsIntroDialog', () => {
    const wrapper = shallow(
      <StandardsView {...DEFAULT_PROPS} showStandardsIntroDialog={true} />
    );
    expect(wrapper.find('Connect(StandardsIntroDialog)')).toHaveLength(1);
  });

  it('standards view shows StandardsProgressTable', () => {
    const wrapper = shallow(
      <StandardsView {...DEFAULT_PROPS} showStandardsIntroDialog={true} />
    );
    expect(wrapper.find('Connect(StandardsProgressTable)')).toHaveLength(1);
  });

  it('standards view shows StandardsLegend', () => {
    const wrapper = shallow(
      <StandardsView {...DEFAULT_PROPS} showStandardsIntroDialog={true} />
    );
    expect(wrapper.find('StandardsLegend')).toHaveLength(1);
  });

  it('standards view shows additional information', () => {
    const wrapper = shallow(
      <StandardsView {...DEFAULT_PROPS} showStandardsIntroDialog={true} />
    );
    expect(wrapper.find('#test-how-to-standards')).toHaveLength(1);
  });
});
