import React from 'react';
import {shallow, mount} from 'enzyme';
import {
  BasicBubble,
  BubbleShape,
  BubbleSize,
  BubbleTooltip,
  getBubbleContent,
  getBubbleShape,
  getBubbleUrl,
  unitTestExports
} from '@cdo/apps/templates/progress/BubbleFactory';
import {fakeLevel} from '@cdo/apps/templates/progress/progressTestHelpers';
import * as progressHelpers from '@cdo/apps/templates/progress/progressHelpers';
import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import i18n from '@cdo/locale';

describe('BubbleFactory', () => {
  describe('BasicBubble', () => {
    const DEFAULT_PROPS = {
      shape: BubbleShape.circle,
      size: BubbleSize.dot,
      progressStyle: {},
      classNames: '',
      children: <div />
    };

    const setUp = (overrideProps = {}) => {
      const props = {...DEFAULT_PROPS, ...overrideProps};
      return shallow(<BasicBubble {...props} />);
    };

    it('renders a DiamondContainer with size if the bubble shape is diamond', () => {
      const bubbleSize = BubbleSize.full;
      const wrapper = setUp({
        size: bubbleSize,
        shape: BubbleShape.diamond
      });
      expect(wrapper.find(unitTestExports.DiamondContainer)).to.have.length(1);
      expect(
        wrapper.find(unitTestExports.DiamondContainer).props().size
      ).to.equal(bubbleSize);
    });

    it('renders children if it is a diamond', () => {
      const child = <div>some child</div>;
      const wrapper = setUp({
        shape: BubbleShape.diamond,
        children: child
      });
      expect(wrapper.contains(child)).to.be.true;
    });

    it('renders a div with children if it is a circle', () => {
      const child = <div>some child</div>;
      const wrapper = setUp({
        shape: BubbleShape.circle,
        children: child
      });
      expect(wrapper.contains(child)).to.be.true;
    });
  });

  describe('BubbleTooltip', () => {
    const DEFAULT_PROPS = {
      level: fakeLevel(),
      children: <div />
    };

    const setUp = (overrideProps = {}) => {
      const props = {...DEFAULT_PROPS, ...overrideProps};
      return shallow(<BubbleTooltip {...props} />);
    };

    it('renders children', () => {
      const child = <div>some child</div>;
      const wrapper = setUp({children: child});
      expect(wrapper.contains(child)).to.be.true;
    });

    it('tooltipText includes unplugged activity text if the level is unplugged', () => {
      const unpluggedLevel = fakeLevel({isUnplugged: true});
      const wrapper = setUp({level: unpluggedLevel});
      expect(wrapper.find('TooltipWithIcon').props().text).to.contain(
        i18n.unpluggedActivity()
      );
    });

    it('tooltipText includes name of level if level has a name and is not unplugged', () => {
      const levelName = 'Test name';
      const testLevel = fakeLevel({isUnplugged: false, name: levelName});
      const wrapper = setUp({level: testLevel});
      expect(wrapper.find('TooltipWithIcon').props().text).to.contain(
        levelName
      );
    });

    it('tooltipText includes progressionDisplayName if the level has progressionDisplayName and no name and is not unplugged', () => {
      const progressionName = 'Level Progression Name';
      const testLevel = fakeLevel({
        isUnplugged: false,
        name: undefined,
        progressionDisplayName: progressionName
      });
      const wrapper = setUp({level: testLevel});
      expect(wrapper.find('TooltipWithIcon').props().text).to.contain(
        progressionName
      );
    });

    it('tooltipText includes a level number if the level has one', () => {
      const levelNumber = 1;
      const testLevel = fakeLevel({
        levelNumber
      });
      const wrapper = setUp({level: testLevel});
      expect(wrapper.find('TooltipWithIcon').props().text).to.contain(
        levelNumber
      );
    });

    it('passes icon for the level to TooltipWithIcon', () => {
      const getIconStub = sinon.stub(progressHelpers, 'getIconForLevel');
      const icon = 'test-icon';
      getIconStub.returns(icon);

      const wrapper = setUp();
      expect(wrapper.find('TooltipWithIcon').props().icon).to.equal(icon);

      getIconStub.restore();
    });
  });

  describe('getBubbleContent', () => {
    const setUp = ({
      isLocked = false,
      isUnplugged = false,
      isBonus = false,
      isPaired = false,
      title,
      bubbleSize
    }) => {
      return mount(
        getBubbleContent(
          isLocked,
          isUnplugged,
          isBonus,
          isPaired,
          title,
          bubbleSize
        )
      );
    };

    it('returns null if the bubble size is a dot', () => {
      const bubbleContent = getBubbleContent(
        false,
        false,
        false,
        false,
        'title',
        BubbleSize.dot
      );
      expect(bubbleContent).to.be.null;
    });

    it('returns unplugged text in span if it is unplugged', () => {
      const bubbleContent = setUp({isUnplugged: true});
      expect(bubbleContent.type()).to.equal('span');
      expect(bubbleContent.text()).to.equal(i18n.unpluggedActivity());
    });

    it('returns lock icon if locked', () => {
      const bubbleContent = setUp({isLocked: true});
      expect(bubbleContent.find('FontAwesome').props().icon).to.equal('lock');
    });

    it('return users icon if paired', () => {
      const bubbleContent = setUp({isPaired: true});
      expect(bubbleContent.find('FontAwesome').props().icon).to.equal('users');
    });

    it('returns flag-checkered icon if is bonus', () => {
      const bubbleContent = setUp({isBonus: true});
      expect(bubbleContent.find('FontAwesome').props().icon).to.equal(
        'flag-checkered'
      );
    });

    it('returns the title if it has a title and is not unplugged, locked, paired, or bonus', () => {
      const testTitle = 'A title';
      const bubbleContent = setUp({title: testTitle});
      expect(bubbleContent.type()).to.equal('span');
      expect(bubbleContent.text()).to.equal(testTitle);
    });
  });

  describe('getBubbleShape', () => {
    it('returns pill if isUnplugged', () => {
      expect(getBubbleShape(true, false)).to.equal(BubbleShape.pill);
    });

    it('returns diamond for isConcept', () => {
      expect(getBubbleShape(false, true)).to.equal(BubbleShape.diamond);
    });

    it('returns circle if not isUnplugged or isConcept', () => {
      expect(getBubbleShape(false, false)).to.equal(BubbleShape.circle);
    });
  });

  describe('getBubbleUrl', () => {
    it('returns null if there is no levelUrl', () => {
      const bubbleUrl = getBubbleUrl();
      expect(bubbleUrl).to.equal(null);
    });

    it('returns levelUrl if there are no student or section id', () => {
      const testLevelUrl = 'a-url';
      const bubbleUrl = getBubbleUrl(testLevelUrl);
      expect(bubbleUrl).to.equal(testLevelUrl);
    });

    it('if there is a studentId, append the user_id to url', () => {
      const bubbleUrl = getBubbleUrl('a-url', 1);
      expect(bubbleUrl).to.equal('a-url?user_id=1');
    });

    it('if there is a sectionId append the section_id to the url', () => {
      const bubbleUrl = getBubbleUrl('a-url', 1, 2);
      expect(bubbleUrl).to.equal('a-url?section_id=2&user_id=1');
    });
  });

  describe('mainBubbleStyle', () => {
    it('when shape is a pill style includes bubbleStyles.pill', () => {
      const bubbleStyle = unitTestExports.mainBubbleStyle(
        BubbleShape.pill,
        BubbleSize.full,
        {}
      );

      expect(bubbleStyle).to.include(unitTestExports.bubbleStyles.pill);
    });

    it('when shape is a diamond style includes bubbleStyles.diamond', () => {
      const bubbleStyle = unitTestExports.mainBubbleStyle(
        BubbleShape.diamond,
        BubbleSize.full,
        {}
      );

      expect(bubbleStyle).to.include(unitTestExports.bubbleStyles.diamond);
    });

    it('when shape is a diamond and size is dot has expected border radius, widths, and font size', () => {
      const bubbleStyle = unitTestExports.mainBubbleStyle(
        BubbleShape.diamond,
        BubbleSize.dot,
        {}
      );

      expect(bubbleStyle.borderRadius).to.equal(2);
      expect(bubbleStyle.width).to.equal(10);
      expect(bubbleStyle.maxWidth).to.equal(10);
    });

    it('when shape is a diamond and size is full has expected border radius, widths, and font size', () => {
      const bubbleStyle = unitTestExports.mainBubbleStyle(
        BubbleShape.diamond,
        BubbleSize.full,
        {}
      );

      expect(bubbleStyle.borderRadius).to.equal(4);
      expect(bubbleStyle.fontSize).to.equal(16);
      expect(bubbleStyle.width).to.equal(26);
      expect(bubbleStyle.maxWidth).to.equal(26);
    });

    it('when shape is a circle and size is dot has expected border radius, widths, and font size', () => {
      const bubbleStyle = unitTestExports.mainBubbleStyle(
        BubbleShape.circle,
        BubbleSize.dot,
        {}
      );

      expect(bubbleStyle.borderRadius).to.equal(13);
      expect(bubbleStyle.width).to.equal(13);
      expect(bubbleStyle.maxWidth).to.equal(13);
    });

    it('when shape is a circle and size is letter has expected border radius, widths, and font size', () => {
      const bubbleStyle = unitTestExports.mainBubbleStyle(
        BubbleShape.circle,
        BubbleSize.letter,
        {}
      );

      expect(bubbleStyle.borderRadius).to.equal(20);
      expect(bubbleStyle.fontSize).to.equal(12);
      expect(bubbleStyle.width).to.equal(20);
      expect(bubbleStyle.maxWidth).to.equal(20);
    });

    it('when shape is a circle and size is full has expected border radius, widths, and font size', () => {
      const bubbleStyle = unitTestExports.mainBubbleStyle(
        BubbleShape.circle,
        BubbleSize.full,
        {}
      );

      expect(bubbleStyle.borderRadius).to.equal(34);
      expect(bubbleStyle.fontSize).to.equal(16);
      expect(bubbleStyle.width).to.equal(34);
      expect(bubbleStyle.maxWidth).to.equal(34);
    });

    it('includes bubbleStyles.main and progressStyle', () => {
      const progressStyle = {color: 'blue', backgroundColor: 'purple'};

      const bubbleStyle = unitTestExports.mainBubbleStyle(
        BubbleShape.circle,
        BubbleSize.full,
        progressStyle
      );

      expect(bubbleStyle).to.include(unitTestExports.bubbleStyles.main);
      expect(bubbleStyle).to.include(progressStyle);
    });
  });
});
