import React from 'react';
import {shallow} from 'enzyme';

import testUtils from '../util/testUtils';
import {expect} from '../util/reconfiguredChai';

import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import NonMarkdownInstructions from '@cdo/apps/templates/instructions/NonMarkdownInstructions';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {StatelessMarkdownInstructions} from '@cdo/apps/templates/instructions/MarkdownInstructions';

describe('instructions components', () => {
  testUtils.setExternalGlobals();

  describe('MarkdownInstructions', function() {
    it('standard case had top padding and no left margin', function() {
      const wrapper = shallow(
        <StatelessMarkdownInstructions
          markdown="md"
          markdownClassicMargins={false}
          inTopPane={false}
          noInstructionsWhenCollapsed={true}
        />
      );
      const element = wrapper.find('.instructions-markdown').first();
      expect(element).to.equal(<EnhancedSafeMarkdown markdown="md" />);
      expect(element.props().style.paddingTop).to.equal(19);
      expect(element.props().style.marginBottom).to.equal(35);
      expect(element.props().style.marginLeft).to.equal(undefined);
    });

    it('inTopPane has no top padding', function() {
      const wrapper = shallow(
        <StatelessMarkdownInstructions
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
      expect(elements.last()).to.equal(
        <SafeMarkdown markdown="instructions" />
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
      expect(elements.at(1)).to.equal(
        <SafeMarkdown markdown="short instructions" />
      );
      expect(elements.at(2)).to.equal(
        <SafeMarkdown markdown="long instructions" />
      );
    });
  });
});
