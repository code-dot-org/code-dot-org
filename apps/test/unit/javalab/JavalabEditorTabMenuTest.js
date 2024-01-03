import {assert} from '../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
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
    cancelTabMenu = sinon.stub();
    renameFromTabMenu = sinon.stub();
    moveTabLeft = sinon.stub();
    moveTabRight = sinon.stub();
    deleteFromTabMenu = sinon.stub();
    changeFileTypeFromTabMenu = sinon.stub();

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
      assert.strictEqual(wrapper.children().length, 3);
      assert.isTrue(wrapper.childAt(1).text().includes(javalabMsg.moveRight()));
    });

    it('displays moveLeft option and not moveRight if active tab is rightmost tab', () => {
      const wrapper = createWrapper({
        activeTabKey: 'file-2',
      });
      assert.strictEqual(wrapper.children().length, 3);
      assert.isTrue(wrapper.childAt(1).text().includes(javalabMsg.moveLeft()));
    });

    it('displays both moveRight and moveLeft if active tab is one of middle tabs', () => {
      const wrapper = createWrapper({
        activeTabKey: 'file-1',
      });
      assert.strictEqual(wrapper.children().length, 4);
      assert.isTrue(wrapper.childAt(1).text().includes(javalabMsg.moveLeft()));
      assert.isTrue(wrapper.childAt(2).text().includes(javalabMsg.moveRight()));
    });
  });

  describe('When there is only 1 tab in Java Lab editor', () => {
    it('does not display moveRight nor moveLeft', () => {
      const wrapper = createWrapper({
        orderedTabKeys: ['file-0'],
      });
      assert.strictEqual(wrapper.children().length, 2);
      assert.isTrue(wrapper.childAt(0).text().includes(javalabMsg.rename()));
      assert.isTrue(wrapper.childAt(1).text().includes(javalabMsg.delete()));
    });
  });
});
