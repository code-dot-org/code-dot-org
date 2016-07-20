/** @file Tests for Dialog component */
import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../util/configuredChai';
import {setupLocales} from '../../util/testUtils';

// Import order matters here :(
setupLocales();
const Dialog = require('@cdo/apps/templates/Dialog').default;

describe('Dialog', function () {
  describe('fullWidth option', function () {
    it('has only the modal class (no explicit width) by default', function () {
      const result = mount(<Dialog isOpen/>);
      expect(result.find('.modal').props().style).to.be.undefined;
    });

    it('has 90% width and -45% left margin if fullWidth is provided', function () {
      const result = mount(<Dialog isOpen fullWidth/>);
      expect(result.find('.modal').props().style).to.deep.equal({
        width: '90%',
        marginLeft: '-45%'
      });
    });
  });
});
