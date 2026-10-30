import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import $ from 'jquery';
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {PoemEditor} from '@cdo/apps/p5lab/poetry/PoemSelector';
import * as utils from '@cdo/apps/utils';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports
import {replaceOnWindow, restoreOnWindow} from '../../../util/testUtils';

describe('PoemEditor', () => {
  // PoemEditor pulls this string from i18n, but we'll hardcode it in tests for simplicity.
  const enterMyOwn = 'Enter my own';

  describe('with initialPoem', () => {
    it('populates inputs with initial values', () => {
      const wrapper = mount(
        <PoemEditor
          isOpen
          handleClose={() => {}}
          initialPoem={{
            title: 'My title',
            // Intentionally leave author blank.
            lines: ['this is', 'a good poem'],
          }}
        />
      );

      expect(wrapper.find('input').at(0).props().value).to.equal('My title');
      expect(wrapper.find('input').at(1).props().value).to.be.empty;
      expect(wrapper.find('textarea').at(0).props().value).to.equal(
        'this is\na good poem'
      );
    });
  });

  describe('saving', () => {
    let mockAppOptions, handleCloseSpy;

    beforeEach(() => {
      mockAppOptions = {
        locale: 'en_us',
        authenticityToken: '123',
      };
      replaceOnWindow('appOptions', mockAppOptions);
      handleCloseSpy = sinon.spy();
    });

    afterEach(() => {
      restoreOnWindow('appOptions');
      sinon.restore();
    });

    it('is successful if no profanity', () => {
      sinon.stub(utils, 'findProfanity').returns($.Deferred().resolve(null));
      const wrapper = mount(<PoemEditor isOpen handleClose={handleCloseSpy} />);

      // Update title, author, and poem and save.
      updatePoemInputs(wrapper, 'title', 'author', 'my\npoem');
      wrapper.find('FooterButton').simulate('click');

      expect(utils.findProfanity).to.have.been.calledOnceWith(
        'title author my\npoem',
        mockAppOptions.locale,
        mockAppOptions.authenticityToken
      );
      expect(handleCloseSpy).to.have.been.calledOnceWith({
        key: enterMyOwn,
        title: 'title',
        author: 'author',
        lines: ['my', 'poem'],
      });
    });

    it('is successful on server failure', () => {
      sinon.stub(utils, 'findProfanity').returns($.Deferred().reject());
      const wrapper = mount(<PoemEditor isOpen handleClose={handleCloseSpy} />);

      // Update title, author, and poem and save.
      updatePoemInputs(wrapper, 'title', 'author', 'poem');
      wrapper.find('FooterButton').simulate('click');

      expect(utils.findProfanity).to.have.been.calledOnceWith(
        'title author poem',
        mockAppOptions.locale,
        mockAppOptions.authenticityToken
      );
      expect(handleCloseSpy).to.have.been.calledOnceWith({
        key: enterMyOwn,
        title: 'title',
        author: 'author',
        lines: ['poem'],
      });
    });

    it('is unsuccessful if profanity', () => {
      sinon
        .stub(utils, 'findProfanity')
        .returns($.Deferred().resolve(['swear']));
      const wrapper = mount(<PoemEditor isOpen handleClose={handleCloseSpy} />);

      // Update title and attempt a save.
      updatePoemInputs(wrapper, 'swear', 'in', 'my poem');
      wrapper.find('FooterButton').simulate('click');

      expect(utils.findProfanity).to.have.been.calledOnceWith(
        'swear in my poem',
        mockAppOptions.locale,
        mockAppOptions.authenticityToken
      );
      expect(handleCloseSpy).to.not.have.been.called;
    });
  });
});

function updatePoemInputs(wrapper, title, author, poem) {
  if (title) {
    wrapper
      .find('input')
      .at(0)
      .simulate('change', {target: {value: title}});
  }

  if (author) {
    wrapper
      .find('input')
      .at(1)
      .simulate('change', {target: {value: author}});
  }

  if (poem) {
    wrapper.find('textarea').simulate('change', {target: {value: poem}});
  }
}
