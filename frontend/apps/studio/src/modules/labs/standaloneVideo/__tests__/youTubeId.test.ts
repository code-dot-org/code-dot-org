import {describe, expect, it} from 'vitest';

import {youTubeIdFromEmbedUrl} from '../youTubeId';

const CASES: Array<[string, string | undefined, string | undefined]> = [
  [
    'full realistic serializer output',
    'https://www.youtube-nocookie.com/embed/KHbwOetbmbs/?autoplay=0&enablejsapi=1&iv_load_policy=3&modestbranding=1&rel=0&showinfo=1&v=KHbwOetbmbs&wmode=transparent',
    'KHbwOetbmbs',
  ],
  [
    'no query string',
    'https://www.youtube-nocookie.com/embed/KHbwOetbmbs/',
    'KHbwOetbmbs',
  ],
  [
    'no trailing slash',
    'https://www.youtube-nocookie.com/embed/KHbwOetbmbs',
    'KHbwOetbmbs',
  ],
  [
    'protocol-relative url',
    '//www.youtube.com/embed/KHbwOetbmbs/',
    'KHbwOetbmbs',
  ],
  [
    'youtubeeducation.com host',
    'https://www.youtubeeducation.com/embed/KHbwOetbmbs/',
    'KHbwOetbmbs',
  ],
  [
    'youtube-nocookie.com host, no www',
    'https://youtube-nocookie.com/embed/KHbwOetbmbs/',
    'KHbwOetbmbs',
  ],
  ['non-youtube url', 'https://example.com/video/KHbwOetbmbs', undefined],
  ['undefined input', undefined, undefined],
  [
    'id shorter than 11 characters',
    'https://www.youtube-nocookie.com/embed/short/?autoplay=0',
    undefined,
  ],
];

describe('youTubeIdFromEmbedUrl', () => {
  it.each(CASES)('%s', (_description, src, expected) => {
    expect(youTubeIdFromEmbedUrl(src)).toBe(expected);
  });
});
