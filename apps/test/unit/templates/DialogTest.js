/** @file Tests for Dialog component */
import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import Dialog from '@cdo/apps/templates/Dialog';

import {expect} from '../../util/reconfiguredChai';

describe('Dialog', function () {
  describe('fullWidth option', function () {
    it('has only the modal class (no explicit width) by default', function () {
      const result = mount(<Dialog isOpen />);
      expect(result.find('.modal').props().style.width).to.be.undefined;
    });

    it('has 90% width and -45% left margin if fullWidth is provided', function () {
      const result = mount(<Dialog isOpen fullWidth />);
      expect(result.find('.modal').props().style).to.deep.equal({
        width: '90%',
        marginLeft: '-45%',
      });
    });
  });
});
