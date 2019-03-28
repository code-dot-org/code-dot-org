import {expect} from '../util/configuredChai';
var testUtils = require('./../util/testUtils');
import React from 'react';
import {mount} from 'enzyme';
import {StatelessMarkdownInstructions} from '@cdo/apps/templates/instructions/MarkdownInstructions';

describe('instructions components', () => {
  testUtils.setExternalGlobals();

  describe('MarkdownInstructions', function() {
    it('standard case had top padding and no left margin', function() {
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

    it('inTopPane has no top padding', function() {
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
});
