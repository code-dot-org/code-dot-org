import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import StandardsView from '@cdo/apps/templates/sectionProgress/standards/StandardsView';

describe('SectionProgress', () => {
  let DEFAULT_PROPS;

  beforeEach(() => {
    DEFAULT_PROPS = {
      showStandardsIntroDialog: false
    };
  });

  it('standards view shows StandardsIntroDialog', () => {
    const wrapper = shallow(
      <StandardsView {...DEFAULT_PROPS} showStandardsIntroDialog={true} />
    );
    expect(wrapper.find('Connect(StandardsIntroDialog)')).to.have.lengthOf(1);
  });
});
