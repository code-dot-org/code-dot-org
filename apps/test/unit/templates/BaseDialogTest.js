/** @file Tests for BaseDialog component */
import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import BaseDialog from '@cdo/apps/templates/BaseDialog';

describe('BaseDialog', function () {
  describe('fullWidth option', function () {
    it('has only the modal class (no explicit width) by default', function () {
      const result = shallow(<BaseDialog isOpen/>);
      expect(result.find('.modal').props().style.width).to.be.undefined;
    });

    it('has 90% width and -45% left margin if fullWidth is provided', function () {
      const result = shallow(<BaseDialog isOpen fullWidth/>);
      expect(result.find('.modal').props().style).to.deep.equal({
        width: '90%',
        marginLeft: '-45%'
      });
    });
  });
});
