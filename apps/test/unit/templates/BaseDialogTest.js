/** @file Tests for BaseDialog component */
import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import BaseDialog from '@cdo/apps/templates/BaseDialog';

describe('BaseDialog', function () {
  describe('fullWidth option', function () {
    it('has only the modal class (no explicit width) by default', function () {
      const result = mount(<BaseDialog isOpen />);
      expect(result.find('.modal').props().style.width).toBeUndefined();
    });

    it('has 90% width and -45% left margin if fullWidth is provided', function () {
      const result = mount(<BaseDialog isOpen fullWidth />);
      expect(result.find('.modal-dialog').props().style).toEqual({
        width: '90%',
      });
    });
  });

  describe('style option', function () {
    it('applies box styles to the visible .modal-content box', function () {
      const result = mount(
        <BaseDialog
          isOpen
          useUpdatedStyles
          style={{padding: 20, color: 'red'}}
        />
      );
      expect(result.find('.modal-content').props().style).toEqual({
        padding: 20,
        color: 'red',
      });
      expect(result.find('.modal-dialog').props().style).toEqual({
        width: 700,
      });
    });

    it('moves width and top onto the .modal-dialog wrapper', function () {
      const result = mount(
        <BaseDialog isOpen style={{width: 740, top: '20%', padding: 20}} />
      );
      expect(result.find('.modal-dialog').props().style).toEqual({
        width: 740,
        top: '20%',
      });
      expect(result.find('.modal-content').props().style).toEqual({
        padding: 20,
      });
    });

    it('lets style.width override fixedWidth', function () {
      const result = mount(
        <BaseDialog
          isOpen
          useUpdatedStyles
          fixedWidth={300}
          style={{width: 740}}
        />
      );
      expect(result.find('.modal-dialog').props().style.width).toBe(740);
    });
  });
});
