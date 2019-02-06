import {expect} from '../util/configuredChai';
var testUtils = require('./../util/testUtils');
import React from 'react';
import {mount} from 'enzyme';
import {StatelessMarkdownInstructions} from '@cdo/apps/templates/instructions/MarkdownInstructions';
import NonMarkdownInstructions from '@cdo/apps/templates/instructions/NonMarkdownInstructions';

describe('instructions components', () => {
  testUtils.setExternalGlobals();

  describe('MarkdownInstructions', function () {
    it('standard case had top padding and no left margin', function () {
      var dom = mount(
        <div>
          <StatelessMarkdownInstructions
            markdown="md"
            markdownClassicMargins={false}
            inTopPane={false}
            noInstructionsWhenCollapsed={true}
          />
        </div>
      );
      var element = dom.find('.instructions-markdown').first();
      expect(element.props().style.paddingTop).to.equal(19);
      expect(element.props().style.marginBottom).to.equal(35);
      expect(element.props().style.marginLeft).to.equal(undefined);
      expect(element.text()).to.equal('md\n');
    });

    it('inTopPane has no top padding', function () {
      var dom = mount(
        <div>
          <StatelessMarkdownInstructions
            markdown="md"
            inTopPane={true}
            noInstructionsWhenCollapsed={true}
          />
        </div>
      );
      var element = dom.find('.instructions-markdown').first();
      expect(element.props().style.paddingTop).to.equal(0);
    });
  });

  describe('NonMarkdownInstructions', function () {
    it('can have just instructions', function () {
      var dom = mount(
        <div>
          <NonMarkdownInstructions
            puzzleTitle="title"
            shortInstructions="instructions"
          />
        </div>
      );
      var element = dom.find('p');
      expect(element.length).to.equal(2);
      expect(element.first()).text().to.equal('title');
      expect(element.last()).text().to.equal('instructions');
    });

    it('can have both instructions and instructions2', function () {
      var dom = mount(
        <div>
          <NonMarkdownInstructions
            puzzleTitle="title"
            shortInstructions="instructions"
            instructions2="instructions2"
          />
        </div>
      );
      var element = dom.find('p');
      expect(element.length).to.equal(3);
      expect(element.get(0).textContent).to.equal('title');
      expect(element.get(1).textContent).to.equal('instructions');
      expect(element.get(2).textContent).to.equal('instructions2');
    });
  });
});
