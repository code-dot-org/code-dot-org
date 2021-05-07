import React from 'react';
import {shallow, mount} from 'enzyme';
import {
  BasicBubble,
  BubbleTooltip,
  getBubbleContent,
  getBubbleShape,
  getBubbleUrl
} from '@cdo/apps/templates/progress/BubbleFactory';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';
import {fakeLevel} from '@cdo/apps/templates/progress/progressTestHelpers';
import * as progressHelpers from '@cdo/apps/templates/progress/progressHelpers';
import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import i18n from '@cdo/locale';

describe('BubbleFactory', () => {
  describe('BasicBubble', () => {
    const DEFAULT_PROPS = {
      shape: progressStyles.BubbleShape.circle,
      size: progressStyles.BubbleSize.dot,
      progressStyle: {},
      classNames: '',
      children: <div />
    };

    const setUp = (overrideProps = {}) => {
      const props = {...DEFAULT_PROPS, ...overrideProps};
      return shallow(<BasicBubble {...props} />);
    };

    it('calls mainBubbleStyle', () => {
      const mainBubbleStyleSpy = sinon.spy(progressStyles, 'mainBubbleStyle');
      setUp();
      expect(mainBubbleStyleSpy).to.have.been.called;
    });

    it('renders a DiamondContainer with size if the bubble shape is diamond', () => {
      const bubbleSize = progressStyles.BubbleSize.full;
      const wrapper = setUp({
        size: bubbleSize,
        shape: progressStyles.BubbleShape.diamond
      });
      expect(wrapper.find('DiamondContainer')).to.have.length(1);
      expect(wrapper.find('DiamondContainer').props().size).to.equal(
        bubbleSize
      );
    });

    it('renders children if it is a diamond', () => {
      const child = <div>some child</div>;
      const wrapper = setUp({
        shape: progressStyles.BubbleShape.diamond,
        children: child
      });
      expect(wrapper.contains(child)).to.be.true;
    });

    it('renders a div with children if it is a circle', () => {
      const child = <div>some child</div>;
      const wrapper = setUp({
        shape: progressStyles.BubbleShape.circle,
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
        progressStyles.BubbleSize.dot
      );
      expect(bubbleContent).to.be.null;
    });

    it('returns unplugged text in span if it is unplugged', () => {
      const bubbleContent = setUp({isUnplugged: true});
      expect(bubbleContent.type()).to.equal('span');
      expect(bubbleContent).to.contain(i18n.unpluggedActivity());
    });

    it('returns lock icon if locked', () => {
      const bubbleContent = setUp({isLocked: true});
      console.log(bubbleContent.debug());
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
      expect(bubbleContent).to.contain(testTitle);
    });
  });

  describe('getBubbleShape', () => {
    it('returns pill if isUnplugged', () => {
      expect(getBubbleShape(true, false)).to.equal(
        progressStyles.BubbleShape.pill
      );
    });

    it('returns diamond for isConcept', () => {
      expect(getBubbleShape(false, true)).to.equal(
        progressStyles.BubbleShape.diamond
      );
    });

    it('returns circle if not isUnplugged or isConcept', () => {
      expect(getBubbleShape(false, false)).to.equal(
        progressStyles.BubbleShape.circle
      );
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
});
