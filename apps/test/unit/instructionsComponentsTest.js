import {expect} from '../util/reconfiguredChai';
var testUtils = require('./../util/testUtils');
import React from 'react';
import {mount} from 'enzyme';
import {StatelessMarkdownInstructions} from '@cdo/apps/templates/instructions/MarkdownInstructions';
import NonMarkdownInstructions from '@cdo/apps/templates/instructions/NonMarkdownInstructions';

describe('instructions components', () => {
  testUtils.setExternalGlobals();

  describe('MarkdownInstructions', function() {
    it('standard case had top padding and no left margin', function() {
      const wrapper = mount(
        <StatelessMarkdownInstructions
          markdown="md"
          markdownClassicMargins={false}
          inTopPane={false}
          noInstructionsWhenCollapsed={true}
        />
      );
      const element = wrapper.find('.instructions-markdown').first();
      expect(element.props().style.paddingTop).to.equal(19);
      expect(element.props().style.marginBottom).to.equal(35);
      expect(element.props().style.marginLeft).to.equal(undefined);
      expect(element.text()).to.equal('md');
    });

    it('inTopPane has no top padding', function() {
      const wrapper = mount(
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
      const wrapper = mount(
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
      expect(elements.last().text()).to.equal('instructions');
    });

    it('can have both instructions and instructions2', function() {
      const wrapper = mount(
        <NonMarkdownInstructions
          puzzleTitle="title"
          shortInstructions="instructions"
          instructions2="instructions2"
        />
      );
      const elements = wrapper
        .find('div')
        .first()
        .children();
      expect(elements.length).to.equal(3);
      expect(elements.at(0).text()).to.equal('title');
      expect(elements.at(1).text()).to.equal('instructions');
      expect(elements.at(2).text()).to.equal('instructions2');
    });
  });
});
