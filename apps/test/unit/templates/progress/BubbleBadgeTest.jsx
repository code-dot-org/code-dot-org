import React from 'react';
import {mount, shallow} from 'enzyme';
import {
  BubbleBadgeWrapper,
  KeepWorkingBadge,
  AssessmentBadge
} from '@cdo/apps/templates/progress/BubbleBadge';
import {expect} from '../../../util/reconfiguredChai';
import color from '@cdo/apps/util/color';

describe('BubbleBadge', () => {
  describe('BubbleBadgeWrapper', () => {
    it('positions the wrapper correctly if isDiamond is false', () => {
      const children = <div />;
      const wrapper = shallow(
        <BubbleBadgeWrapper isDiamond={false}>{children}</BubbleBadgeWrapper>
      );
      expect(wrapper.props().style.top).to.equal(-7);
      expect(wrapper.props().style.right).to.equal(-7);
    });

    it('positions the wrapper correctly if isDiamond is true', () => {
      const children = <div />;
      const wrapper = shallow(
        <BubbleBadgeWrapper isDiamond={true}>{children}</BubbleBadgeWrapper>
      );
      console.log(wrapper.debug());
      expect(wrapper.props().style.top).to.equal(-13);
      expect(wrapper.props().style.right).to.equal(-17);
    });
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
