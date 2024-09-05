import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {JavalabEditorTabMenu} from '@cdo/apps/javalab/JavalabEditorTabMenu';
import javalabMsg from '@cdo/javalab/locale';

describe('JavalabEditorTabMenu', () => {
  let cancelTabMenu,
    renameFromTabMenu,
    moveTabLeft,
    moveTabRight,
    deleteFromTabMenu,
    changeFileTypeFromTabMenu,
    defaultProps;

  beforeEach(() => {
    cancelTabMenu = jest.fn();
    renameFromTabMenu = jest.fn();
    moveTabLeft = jest.fn();
    moveTabRight = jest.fn();
    deleteFromTabMenu = jest.fn();
    changeFileTypeFromTabMenu = jest.fn();

    defaultProps = {
      cancelTabMenu,
      renameFromTabMenu,
      moveTabLeft,
      moveTabRight,
      deleteFromTabMenu,
      changeFileTypeFromTabMenu,
      showVisibilityOption: false,
      fileIsVisible: true,
      fileIsValidation: false,
      activeTabKey: 'file-0',
      orderedTabKeys: ['file-0', 'file-1', 'file-2'],
    };
  });

  function createWrapper(overrideProps) {
    return shallow(
      <JavalabEditorTabMenu {...defaultProps} {...overrideProps} />
    );
  }

  describe('When there are 3 or more tabs in Java Lab editor', () => {
    it('displays moveRight option and not moveLeft if active tab is leftmost tab', () => {
      const wrapper = createWrapper();
      expect(wrapper.children().length).toBe(3);
      expect(wrapper.childAt(1).text().includes(javalabMsg.moveRight())).toBe(
        true
      );
    });

    it('displays moveLeft option and not moveRight if active tab is rightmost tab', () => {
      const wrapper = createWrapper({
        activeTabKey: 'file-2',
      });
      expect(wrapper.children().length).toBe(3);
      expect(wrapper.childAt(1).text().includes(javalabMsg.moveLeft())).toBe(
        true
      );
    });

    it('displays both moveRight and moveLeft if active tab is one of middle tabs', () => {
      const wrapper = createWrapper({
        activeTabKey: 'file-1',
      });
      expect(wrapper.children().length).toBe(4);
      expect(wrapper.childAt(1).text().includes(javalabMsg.moveLeft())).toBe(
        true
      );
      expect(wrapper.childAt(2).text().includes(javalabMsg.moveRight())).toBe(
        true
      );
    });
  });

  describe('When there is only 1 tab in Java Lab editor', () => {
    it('does not display moveRight nor moveLeft', () => {
      const wrapper = createWrapper({
        orderedTabKeys: ['file-0'],
      });
      expect(wrapper.children().length).toBe(2);
      expect(wrapper.childAt(0).text().includes(javalabMsg.rename())).toBe(
        true
      );
      expect(wrapper.childAt(1).text().includes(javalabMsg.delete())).toBe(
        true
      );
    });
  });
});
