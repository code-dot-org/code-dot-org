import React from 'react';
import {assert} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import ProgressBox from '@cdo/apps/templates/sectionProgress/ProgressBox';
import color from '@cdo/apps/util/color';

const DEFAULT_PROPS = {
  started: true,
  incomplete: 2,
  imperfect: 0,
  perfect: 2,
  style: {},
  stageIsAllAssessment: false
};

describe('ProgressBox', () => {
  it('renders progress bar as green when stageIsAllAssessment prop is false', () => {
    const wrapper = shallow(<ProgressBox {...DEFAULT_PROPS} />);
    assert.equal(
      wrapper
        .find('.uitest-perfect-bar')
        .first()
        .props().style.backgroundColor,
      color.level_perfect
    );
  });

  it('renders progress bar as purple when stageIsAllAssessment prop is true', () => {
    const wrapper = shallow(
      <ProgressBox {...DEFAULT_PROPS} stageIsAllAssessment={true} />
    );
    assert.equal(
      wrapper
        .find('.uitest-perfect-bar')
        .first()
        .props().style.backgroundColor,
      color.level_submitted
    );
  });
});
