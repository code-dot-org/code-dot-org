import React from 'react';
import {shallow} from 'enzyme';

import {expect} from '../util/reconfiguredChai';
import {setExternalGlobals} from '../util/testUtils';

import NonMarkdownInstructions from '@cdo/apps/templates/instructions/NonMarkdownInstructions';
import MarkdownInstructions from '@cdo/apps/templates/instructions/MarkdownInstructions';

describe('instructions components', () => {
  setExternalGlobals();

  describe('MarkdownInstructions', function() {
    it('standard case had top padding and no left margin', function() {
      const wrapper = shallow(
        <MarkdownInstructions
          markdown="md"
          markdownClassicMargins={false}
          inTopPane={false}
          noInstructionsWhenCollapsed={true}
        />
      );

      const containerElement = wrapper.find('.instructions-markdown').first();
      expect(containerElement.props().style.paddingTop).to.equal(19);
      expect(containerElement.props().style.marginBottom).to.equal(35);
      expect(containerElement.props().style.marginLeft).to.equal(undefined);

      const markdownElement = wrapper.find('EnhancedSafeMarkdown').first();
      expect(markdownElement.props().markdown).to.equal('md');
    });

    it('inTopPane has no top padding', function() {
      const wrapper = shallow(
        <MarkdownInstructions
          markdown="md"
          inTopPane={true}
          noInstructionsWhenCollapsed={true}
        />
      );
      const element = wrapper.find('.instructions-markdown').first();
      expect(element.props().style.paddingTop).to.equal(0);
    });
  });

  describe('NonMarkdownInstructions', function() {
    it('can have just instructions', function() {
      const wrapper = shallow(
        <NonMarkdownInstructions
          puzzleTitle="title"
          shortInstructions="instructions"
        />
      );
      const elements = wrapper
        .find('div')
        .first()
        .children();
      expect(elements.length).to.equal(2);
      expect(elements.first().text()).to.equal('title');

      const markdownElements = wrapper.find('SafeMarkdown');
      expect(markdownElements.length).to.equal(1);
      expect(markdownElements.first().props().markdown).to.equal(
        'instructions'
      );
    });

    it('can have both instructions and instructions2', function() {
      const wrapper = shallow(
        <NonMarkdownInstructions
          puzzleTitle="title"
          shortInstructions="short instructions"
          instructions2="long instructions"
        />
      );
      const elements = wrapper
        .find('div')
        .first()
        .children();
      expect(elements.length).to.equal(3);
      expect(elements.at(0).text()).to.equal('title');

      const markdownElements = wrapper.find('SafeMarkdown');
      expect(markdownElements.length).to.equal(2);
      expect(markdownElements.first().props().markdown).to.equal(
        'short instructions'
      );
      expect(markdownElements.last().props().markdown).to.equal(
        'long instructions'
      );
    });
  });
});
