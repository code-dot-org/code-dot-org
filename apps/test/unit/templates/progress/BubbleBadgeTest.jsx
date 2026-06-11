import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {mount, shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import BubbleBadge, {
  KeepWorkingBadge,
  AssessmentBadge,
  BadgeType,
} from '@cdo/apps/templates/progress/BubbleBadge';
import {
  BubbleSize,
  BubbleShape,
} from '@cdo/apps/templates/progress/BubbleFactory';

describe('BubbleBadge', () => {
  it('renders an AssessmentBadge for BadgeType.assessment', () => {
    const wrapper = shallow(
      <BubbleBadge
        badgeType={BadgeType.assessment}
        bubbleSize={BubbleSize.full}
        bubbleShape={BubbleShape.circle}
      />
    );
    expect(wrapper.find(AssessmentBadge)).toHaveLength(1);
  });

  it('renders a KeepWorkingBadge for BadgeType.keepWorking', () => {
    const wrapper = shallow(
      <BubbleBadge
        badgeType={BadgeType.keepWorking}
        bubbleSize={BubbleSize.full}
        bubbleShape={BubbleShape.circle}
      />
    );
    expect(wrapper.find(KeepWorkingBadge)).toHaveLength(1);
  });

  it('renders nothing for dot bubbles and KeepWorking badge for letter bubbles', () => {
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
    expect(letter.find(KeepWorkingBadge)).toHaveLength(1);
    expect(Object.keys(dot)).toHaveLength(0);
  });

  it('positions the element correctly is bubbleShape is not a diamond for assessment badge', () => {
    const wrapper = mount(
      <BubbleBadge
        badgeType={BadgeType.assessment}
        bubbleShape={BubbleShape.circle}
        bubbleSize={BubbleSize.full}
      />
    );
    expect(wrapper.find('div').props().style.top).toBe(-7);
    expect(wrapper.find('div').props().style.right).toBe(-7);
  });

  it('positions the element correctly is bubbleShape is a diamond for assessment badge', () => {
    const wrapper = mount(
      <BubbleBadge
        badgeType={BadgeType.assessment}
        bubbleShape={BubbleShape.diamond}
        bubbleSize={BubbleSize.full}
      />
    );
    expect(wrapper.find('div').props().style.top).toBe(-13);
    expect(wrapper.find('div').props().style.right).toBe(-17);
  });

  describe('KeepWorkingBadge', () => {
    it('has a red background', () => {
      const wrapper = mount(<KeepWorkingBadge />);
      expect(wrapper.find('div').props().style.backgroundColor).toBe(
        'var(--background-error-primary)'
      );
    });
  });

  describe('AssessmentBadge', () => {
    it('has a purple background', () => {
      const wrapper = mount(<AssessmentBadge />);
      expect(
        wrapper
          .find(FontAwesomeV6Icon)
          .filterWhere(
            n =>
              n.prop('iconName') === 'circle' &&
              n.prop('iconStyle') !== 'regular'
          )
          .props().style.color
      ).toBe('var(--text-brand-purple-primary)');
    });

    it('has a check icon', () => {
      const wrapper = mount(<AssessmentBadge />);
      expect(
        wrapper
          .find(FontAwesomeV6Icon)
          .filterWhere(n => n.prop('iconName') === 'check')
      ).toHaveLength(1);
    });

    describe('displays a white border when hasWhiteBorder is true', () => {
      it('has a exclamation icon', () => {
        const wrapper = mount(<AssessmentBadge hasWhiteBorder={true} />);
        expect(
          wrapper
            .find(FontAwesomeV6Icon)
            .filterWhere(
              n =>
                n.prop('iconName') === 'circle' &&
                n.prop('iconStyle') === 'regular'
            )
        ).toHaveLength(1);
      });
    });
  });
});
