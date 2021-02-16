import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import ProgressTableLessonNumber, {
  unitTestExports
} from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableLessonNumber';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import ReactTooltip from 'react-tooltip';
import sinon from 'sinon';
import color from '@cdo/apps/util/color';

const DEFAULT_PROPS = {
  id: 1,
  name: 'Intro to Problem Solving',
  number: 1,
  lockable: false,
  highlighted: false,
  onClick: () => {},
  includeArrow: false,
  isAssessment: false
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<ProgressTableLessonNumber {...props} />);
};

describe('ProgressTableLessonNumber', () => {
  it('renders tooltip with an icon if isAssessment is true', () => {
    const wrapper = setUp({isAssessment: true});
    const tooltipIcon = wrapper.find({icon: 'check-circle'});
    expect(tooltipIcon).to.have.length(1);
  });

  it('renders tooltip without an icon if isAssessment is false', () => {
    const wrapper = setUp({isAssessment: false});
    const tooltipIcon = wrapper.find({icon: 'check-circle'});
    expect(tooltipIcon).to.have.length(0);
  });

  it('renders the name in the tooltip', () => {
    const wrapper = setUp();
    const tooltipComponent = wrapper.find(ReactTooltip);
    expect(tooltipComponent.contains(DEFAULT_PROPS.name)).to.be.true;
  });

  it('calls onClick when clicked', () => {
    const onClickSpy = sinon.spy();
    const wrapper = setUp({onClick: onClickSpy});
    wrapper.simulate('click');
    expect(onClickSpy).to.have.been.called;
  });

  it('displays highlighed styles when highlighted is true', () => {
    const wrapper = setUp({highlighted: true});
    expect(wrapper.props().style.backgroundColor).to.equal(color.teal);
  });

  it('displays line and arrow when includeArrow is true', () => {
    const wrapper = setUp({includeArrow: true});
    expect(wrapper.find(unitTestExports.LessonArrow)).to.have.length(1);
  });

  it('displays the lock icon if lockable is true', () => {
    const wrapper = setUp({lockable: true});
    const lockIcon = wrapper.find(FontAwesome).find({icon: 'lock'});
    expect(lockIcon).to.have.length(1);
  });

  it('displays number if lockable is false', () => {
    const wrapper = setUp({lockable: false});
    const lockIcon = wrapper.find(FontAwesome).find({icon: 'lock'});
    expect(lockIcon).to.have.length(0);
    expect(wrapper.contains(DEFAULT_PROPS.number)).to.be.true;
  });
});
