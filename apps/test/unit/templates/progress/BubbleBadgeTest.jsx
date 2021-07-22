import React from 'react';
import {mount, shallow} from 'enzyme';
import BubbleBadge, {
  KeepWorkingBadge,
  AssessmentBadge,
  BadgeType
} from '@cdo/apps/templates/progress/BubbleBadge';
import {
  BubbleSize,
  BubbleShape
} from '@cdo/apps/templates/progress/BubbleFactory';
import {expect} from '../../../util/reconfiguredChai';
import color from '@cdo/apps/util/color';

describe('BubbleBadge', () => {
  it('renders an AssessmentBadge for BadgeType.assessment', () => {
    const wrapper = shallow(
      <BubbleBadge
        badgeType={BadgeType.assessment}
        bubbleSize={BubbleSize.full}
        bubbleShape={BubbleShape.circle}
      />
    );
    expect(wrapper.find(AssessmentBadge)).to.have.lengthOf(1);
  });

  it('renders a KeepWorkingBadge for BadgeType.keepWorking', () => {
    const wrapper = shallow(
      <BubbleBadge
        badgeType={BadgeType.keepWorking}
        bubbleSize={BubbleSize.full}
        bubbleShape={BubbleShape.circle}
      />
    );
    expect(wrapper.find(KeepWorkingBadge)).to.have.lengthOf(1);
  });

  it('renders nothing for small bubbles', () => {
    const letter = shallow(
      <BubbleBadge
        badgeType={BadgeType.keepWorking}
        bubbleSize={BubbleSize.letter}
        bubbleShape={BubbleShape.circle}
      />
    );
    const dot = shallow(
      <BubbleBadge
        badgeType={BadgeType.keepWorking}
        bubbleSize={BubbleSize.dot}
        bubbleShape={BubbleShape.circle}
      />
    );
    expect(letter).to.be.empty;
    expect(dot).to.be.empty;
  });

  it('positions the element correctly is bubbleShape is not a diamond', () => {
    const wrapper = mount(
      <BubbleBadge
        badgeType={BadgeType.keepWorking}
        bubbleShape={BubbleShape.circle}
        bubbleSize={BubbleSize.full}
      />
    );
    expect(wrapper.find('div').props().style.top).to.equal(-7);
    expect(wrapper.find('div').props().style.right).to.equal(-7);
  });

  it('positions the element correctly is bubbleShape is a diamond', () => {
    const wrapper = mount(
      <BubbleBadge
        badgeType={BadgeType.keepWorking}
        bubbleShape={BubbleShape.diamond}
        bubbleSize={BubbleSize.full}
      />
    );
    expect(wrapper.find('div').props().style.top).to.equal(-13);
    expect(wrapper.find('div').props().style.right).to.equal(-17);
  });

  describe('KeepWorkingBadge', () => {
    it('has a red background', () => {
      const wrapper = mount(<KeepWorkingBadge />);
      expect(
        wrapper.find('FontAwesome[icon="circle"]').props().style.color
      ).to.equal(color.red);
    });

    it('has a exclamation icon', () => {
      const wrapper = mount(<KeepWorkingBadge />);
      expect(wrapper.find('FontAwesome[icon="exclamation"]')).to.have.length(1);
    });

    it('displays a white border when hasWhiteBorder is true', () => {
      it('has a exclamation icon', () => {
        const wrapper = mount(<KeepWorkingBadge hasWhiteBorder={true} />);
        expect(wrapper.find('FontAwesome[icon="circle-thin"]')).to.have.length(
          1
        );
      });
    });
  });

  describe('AssessmentBadge', () => {
    it('has a purple background', () => {
      const wrapper = mount(<AssessmentBadge />);
      expect(
        wrapper.find('FontAwesome[icon="circle"]').props().style.color
      ).to.equal(color.purple);
    });

    it('has a check icon', () => {
      const wrapper = mount(<AssessmentBadge />);
      expect(wrapper.find('FontAwesome[icon="check"]')).to.have.length(1);
    });

    it('displays a white border when hasWhiteBorder is true', () => {
      it('has a exclamation icon', () => {
        const wrapper = mount(<AssessmentBadge hasWhiteBorder={true} />);
        expect(wrapper.find('FontAwesome[icon="circle-thin"]')).to.have.length(
          1
        );
      });
    });
  });
});
