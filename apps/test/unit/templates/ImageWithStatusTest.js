import {render, waitFor} from '@testing-library/react';
import React from 'react';

import {ImageWithStatus} from '@cdo/apps/templates/ImageWithStatus';

const CAT_IMAGE_URL = '/base/static/common_images/stickers/cat.png';
const BOGUS_IMAGE_URL = '/nonexistent.png';
const THUMBNAIL_SIZE = 50;

describe('ImageWithStatus', () => {
  it('shows status loading initially', () => {
    const {container} = render(
      <ImageWithStatus
        src={CAT_IMAGE_URL}
        width={THUMBNAIL_SIZE}
        height={THUMBNAIL_SIZE}
      />
    );
    const loading = container.querySelector('div[data-image-status="loading"]');
    expect(loading).not.toBeNull();
  });

  it('shows status loaded after loading a valid image', async () => {
    const {container} = render(
      <ImageWithStatus
        src={CAT_IMAGE_URL}
        width={THUMBNAIL_SIZE}
        height={THUMBNAIL_SIZE}
      />
    );

    const image = container.querySelector(`img[src='${CAT_IMAGE_URL}']`);
    image.dispatchEvent(new Event('load'));

    const loaded = await waitFor(() =>
      container.querySelector('div[data-image-status="loaded"]')
    );
    expect(loaded).not.toBeNull();
  });

  it('shows status loading again if the src url is changed', async () => {
    const {rerender, container} = render(
      <ImageWithStatus
        src={CAT_IMAGE_URL}
        width={THUMBNAIL_SIZE}
        height={THUMBNAIL_SIZE}
      />
    );

    const image = container.querySelector(`img[src='${CAT_IMAGE_URL}']`);
    image.dispatchEvent(new Event('load'));

    let loaded = await waitFor(() =>
      container.querySelector('div[data-image-status="loaded"]')
    );
    expect(loaded).not.toBeNull();

    // Now change the image url
    rerender(
      <ImageWithStatus
        src={BOGUS_IMAGE_URL}
        width={THUMBNAIL_SIZE}
        height={THUMBNAIL_SIZE}
      />
    );

    const loading = container.querySelector('div[data-image-status="loading"]');
    expect(loading).not.toBeNull();

    image.dispatchEvent(new Event('load'));

    loaded = await waitFor(() =>
      container.querySelector('div[data-image-status="loaded"]')
    );
    expect(loaded).not.toBeNull();
  });

  it('shows status error after loading an invalid image', async () => {
    const {container} = render(
      <ImageWithStatus
        src={BOGUS_IMAGE_URL}
        width={THUMBNAIL_SIZE}
        height={THUMBNAIL_SIZE}
      />
    );

    const image = container.querySelector(`img[src='${BOGUS_IMAGE_URL}']`);
    image.dispatchEvent(new Event('error'));

    const error = await waitFor(() =>
      container.querySelector('div[data-image-status="error"]')
    );
    expect(error).not.toBeNull();
  });
});
