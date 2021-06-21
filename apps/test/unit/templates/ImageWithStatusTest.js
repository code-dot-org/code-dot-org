import React from 'react';
import {expect} from '../../util/reconfiguredChai';
import {mount} from 'enzyme';
import {ImageWithStatus} from '@cdo/apps/templates/ImageWithStatus';
import {
  allowConsoleErrors,
  allowConsoleWarnings
} from '../../util/throwOnConsole';

const CAT_IMAGE_URL = '/base/static/common_images/stickers/cat.png';
const BOGUS_IMAGE_URL = '/nonexistent.png';
const THUMBNAIL_SIZE = 50;

describe('ImageWithStatus', () => {
  allowConsoleErrors();
  allowConsoleWarnings();

  it('shows status loading initially', () => {
    const root = mount(
      <ImageWithStatus
        src={CAT_IMAGE_URL}
        width={THUMBNAIL_SIZE}
        height={THUMBNAIL_SIZE}
      />
    );
    const loading = root.find('div[data-image-status="loading"]');
    expect(loading).to.have.length(1);
  });

  it('shows status loaded after loading a valid image', done => {
    const root = mount(
      <ImageWithStatus
        src={CAT_IMAGE_URL}
        width={THUMBNAIL_SIZE}
        height={THUMBNAIL_SIZE}
      />
    );
    const image = new Image();
    image.src = CAT_IMAGE_URL;
    image.onload = function() {
      // There's no guarantee we'll hit this onload after the onload in
      // ImageWithStatus, so wait until the next clock tick before checking
      // expectations.
      setTimeout(function() {
        root.update();
        const loaded = root.find('div[data-image-status="loaded"]');
        expect(loaded).to.have.length(1);
        done();
      }, 0);
    };
  });

  it('shows status loading again if the src url is changed', done => {
    const root = mount(
      <ImageWithStatus
        src={CAT_IMAGE_URL}
        width={THUMBNAIL_SIZE}
        height={THUMBNAIL_SIZE}
      />
    );
    const image = new Image();
    image.src = CAT_IMAGE_URL;
    image.onload = function() {
      // There's no guarantee we'll hit this onload after the onload in
      // ImageWithStatus, so wait until the next clock tick before checking
      // expectations.
      setTimeout(function() {
        root.update();
        const loaded = root.find('div[data-image-status="loaded"]');
        expect(loaded).to.have.length(1);
        changeImageUrl(done);
      }, 0);
    };

    function changeImageUrl(done) {
      root.setProps({src: BOGUS_IMAGE_URL});
      const loading = root.find('div[data-image-status="loading"]');
      expect(loading).to.have.length(1);
      const loaded = root.find('div[data-image-status="loaded"]');
      expect(loaded).to.have.length(0);
      done();
    }
  });

  it('shows status error after loading an invalid image', done => {
    const root = mount(
      <ImageWithStatus
        src={BOGUS_IMAGE_URL}
        width={THUMBNAIL_SIZE}
        height={THUMBNAIL_SIZE}
      />
    );
    const image = new Image();
    image.src = BOGUS_IMAGE_URL;
    image.onerror = function() {
      // There's no guarantee we'll hit this onerror after the onerror in
      // ImageWithStatus, so wait until the next clock tick before checking
      // expectations.
      setTimeout(function() {
        root.update();
        const error = root.find('div[data-image-status="error"]');
        expect(error).to.have.length(1);
        done();
      }, 0);
    };
  });
});
