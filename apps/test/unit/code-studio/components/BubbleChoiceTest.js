import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect, assert} from '../../../util/reconfiguredChai';
import BubbleChoice from '@cdo/apps/code-studio/components/BubbleChoice';
import * as utils from '@cdo/apps/utils';

const fakeSublevels = [
  {
    id: 1,
    display_name: 'Choice 1',
    thumbnail_url: 'some-fake.url/kittens.png',
    url: '/s/script/stage/1/puzzle/2/sublevel/1'
  },
  {
    id: 2,
    display_name: 'Choice 2',
    thumbnail_url: null,
    url: '/s/script/stage/1/puzzle/2/sublevel/2'
  }
];

const DEFAULT_PROPS = {
  level: {
    display_name: 'Bubble Choice',
    description: 'Choose one or more levels!',
    sublevels: fakeSublevels,
    previous_level_url: '/s/script/stage/1/puzzle/1',
    next_level_url: '/s/script/stage/1/puzzle/3',
    script_url: '/s/script'
  }
};

describe('BubbleChoice', () => {
  it('renders level information', () => {
    const wrapper = mount(<BubbleChoice {...DEFAULT_PROPS} />);
    assert.equal(DEFAULT_PROPS.level.display_name, wrapper.find('h1').text());
    assert.equal(
      DEFAULT_PROPS.level.description,
      wrapper.find('SafeMarkdown').text()
    );
  });

  it('renders sublevel thumbnail if present', () => {
    const wrapper = mount(<BubbleChoice {...DEFAULT_PROPS} />);
    const thumbnails = wrapper.find('img');
    assert.equal(1, thumbnails.length);
    assert(
      thumbnails
        .at(0)
        .getDOMNode()
        .src.includes(fakeSublevels[0].thumbnail_url)
    );
  });

  it('renders a placeholder div if sublevel thumbnail is not present', () => {
    const wrapper = mount(<BubbleChoice {...DEFAULT_PROPS} />);
    const placeholderThumbnails = wrapper.find('.placeholder');
    assert.equal(1, placeholderThumbnails.length);
  });

  describe('back and continue buttons', () => {
    beforeEach(() => {
      sinon.stub(utils, 'navigateToHref');
    });

    afterEach(() => {
      utils.navigateToHref.restore();
    });

    it('redirect to previous/next levels', () => {
      const wrapper = mount(<BubbleChoice {...DEFAULT_PROPS} />);

      // 4 buttons - 2 "back" and 2 "continue/finish"
      assert.equal(4, wrapper.find('button').length);

      const backButton = wrapper.find('button').at(0);
      backButton.simulate('click');
      expect(utils.navigateToHref).to.have.been.calledWith(
        DEFAULT_PROPS.level.previous_level_url + window.location.search
      );

      const continueButton = wrapper.find('button').at(1);
      assert.equal('Continue', continueButton.text());
      continueButton.simulate('click');
      expect(utils.navigateToHref).to.have.been.calledWith(
        DEFAULT_PROPS.level.next_level_url + window.location.search
      );
    });

    it('redirect to script page if no previous/next levels', () => {
      const level = {
        ...DEFAULT_PROPS.level,
        previous_level_url: null,
        next_level_url: null
      };
      const wrapper = mount(<BubbleChoice {...DEFAULT_PROPS} level={level} />);

      // 4 buttons - 2 "back" and 2 "continue/finish"
      assert.equal(4, wrapper.find('button').length);

      const backButton = wrapper.find('button').at(0);
      backButton.simulate('click');
      expect(utils.navigateToHref).to.have.been.calledWith(
        DEFAULT_PROPS.level.script_url + window.location.search
      );

      const finishButton = wrapper.find('button').at(1);
      assert.equal('Finish', finishButton.text());
      finishButton.simulate('click');
      expect(utils.navigateToHref).to.have.been.calledWith(
        DEFAULT_PROPS.level.script_url + window.location.search
      );
    });

    it('hides back button if no previous level or script url', () => {
      const level = {
        ...DEFAULT_PROPS.level,
        previous_level_url: null,
        script_url: null
      };
      const wrapper = mount(<BubbleChoice {...DEFAULT_PROPS} level={level} />);
      const buttons = wrapper.find('button');

      assert.equal(2, buttons.length);
      assert.notEqual('Back', buttons.at(0).text());
      assert.notEqual('Back', buttons.at(1).text());
    });

    it('hides continue button if no next level or script url', () => {
      const level = {
        ...DEFAULT_PROPS.level,
        next_level_url: null,
        script_url: null
      };
      const wrapper = mount(<BubbleChoice {...DEFAULT_PROPS} level={level} />);
      const buttons = wrapper.find('button');

      assert.equal(2, buttons.length);
      assert(!['Finish', 'Continue'].includes(buttons.at(0).text()));
      assert(!['Finish', 'Continue'].includes(buttons.at(1).text()));
    });
  });
});
