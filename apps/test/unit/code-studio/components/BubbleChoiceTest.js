import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect, assert} from '../../../util/reconfiguredChai';
import BubbleChoice from '@cdo/apps/code-studio/components/BubbleChoice';
import * as utils from '@cdo/apps/utils';

const fakeSublevels = [
  {
    id: '1',
    display_name: 'Choice 1',
    thumbnail_url: 'some-fake.url/kittens.png',
    url: '/s/script/stage/1/puzzle/2/sublevel/1',
    description: 'Sublevel 1 is lots of fun',
    position: 1,
    letter: 'a',
    status: 'perfect'
  },
  {
    id: '2',
    display_name: 'Choice 2',
    thumbnail_url: null,
    url: '/s/script/stage/1/puzzle/2/sublevel/2',
    description: 'Sublevel 2 has cool stuff to do',
    position: 2,
    letter: 'b',
    status: 'not_tried'
  }
];

const DEFAULT_PROPS = {
  level: {
    id: '123',
    display_name: 'Bubble Choice',
    description: 'Choose one or more levels!',
    sublevels: fakeSublevels,
    previous_level_url: '/s/script/stage/1/puzzle/1',
    redirect_url: '/s/script/stage/1/puzzle/3',
    script_url: '/s/script',
    name: 'Bubble Choice',
    type: 'BubbleChoice',
    teacher_markdown: 'Students should work on which ever bubble they like'
  }
};

describe('BubbleChoice', () => {
  it('renders correct number of sublevels', () => {
    const wrapper = mount(<BubbleChoice {...DEFAULT_PROPS} />);
    assert.equal(2, wrapper.find('SublevelCard').length);
  });

  describe('back and finish buttons', () => {
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

      const finishButton = wrapper.find('button').at(1);
      assert.equal('Finish', finishButton.text());
      finishButton.simulate('click');
      expect(utils.navigateToHref).to.have.been.calledWith(
        DEFAULT_PROPS.level.redirect_url + window.location.search
      );
    });

    it('redirect to script page if no previous_level/redirect urls', () => {
      const level = {
        ...DEFAULT_PROPS.level,
        previous_level_url: null,
        redirect_url: null
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

    it('hides finish button if no redirect or script url', () => {
      const level = {
        ...DEFAULT_PROPS.level,
        redirect_url: null,
        script_url: null
      };
      const wrapper = mount(<BubbleChoice {...DEFAULT_PROPS} level={level} />);
      const buttons = wrapper.find('button');

      assert.equal(2, buttons.length);
      assert.notEqual('Finish', buttons.at(0).text());
      assert.notEqual('Finish', buttons.at(1).text());
    });
  });
});
