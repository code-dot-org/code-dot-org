import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import StageExtras from '@cdo/apps/code-studio/components/stageExtras/StageExtras';
import {bonusLevels} from './stageExtraTestHelpers';

const DEFAULT_PROPS = {
  stageNumber: 1,
  nextStageNumber: 2,
  nextLevelPath: '',
  showProjectWidget: true,
  projectTypes: [],
  bonusLevels: bonusLevels,
  sectionId: 3,
  userId: 5,
  showStageExtrasWarning: true
};

describe('StageExtras', () => {
  it('does not show stage extras warning if showStageExtrasWarning is false', () => {
    const wrapper = shallow(
      <StageExtras {...DEFAULT_PROPS} showStageExtrasWarning={false} />
    );
    expect(wrapper.find('StageExtrasNotification')).to.have.lengthOf(0);
  });

  it('does not show stage extras warning if sectionId is not provided', () => {
    const wrapper = shallow(
      <StageExtras {...DEFAULT_PROPS} sectionId={null} />
    );
    expect(wrapper.find('StageExtrasNotification')).to.have.lengthOf(0);
  });

  it('show stage extra warning if showStageExtrasWarning and have sectionId', () => {
    const wrapper = shallow(<StageExtras {...DEFAULT_PROPS} />);
    expect(wrapper.find('StageExtrasNotification')).to.have.lengthOf(1);
  });
});
