import {describe, expect, it} from 'vitest';
import {
  detectVideoHost,
  youtubeEmbedUrl,
  vimeoEmbedUrl,
} from '../detect';

describe('detectVideoHost', () => {
  it('identifies youtube.com watch URLs as youtube', () => {
    expect(detectVideoHost('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'youtube',
    );
  });

  it('identifies youtu.be short URLs as youtube', () => {
    expect(detectVideoHost('https://youtu.be/dQw4w9WgXcQ')).toBe('youtube');
  });

  it('identifies vimeo.com URLs as vimeo', () => {
    expect(detectVideoHost('https://vimeo.com/123456789')).toBe('vimeo');
  });

  it('identifies .mp4 URLs as direct', () => {
    expect(detectVideoHost('https://example.com/video/lesson.mp4')).toBe(
      'direct',
    );
  });

  it('identifies .webm URLs as direct', () => {
    expect(detectVideoHost('https://example.com/video/lesson.webm')).toBe(
      'direct',
    );
  });

  it('identifies .ogg URLs as direct', () => {
    expect(detectVideoHost('https://example.com/video/lesson.ogg')).toBe(
      'direct',
    );
  });

  it('returns unknown for an unrecognised URL', () => {
    expect(detectVideoHost('https://example.com/some-video-page')).toBe(
      'unknown',
    );
  });

  it('returns unknown for an empty string', () => {
    expect(detectVideoHost('')).toBe('unknown');
  });
});

describe('youtubeEmbedUrl', () => {
  it('converts a watch?v= URL to an embed URL', () => {
    expect(youtubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    );
  });

  it('converts a youtu.be short URL to an embed URL', () => {
    expect(youtubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    );
  });

  it('returns an already-canonical embed URL unchanged', () => {
    const embed = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    expect(youtubeEmbedUrl(embed)).toBe(embed);
  });

  it('returns the original URL when no video ID is found', () => {
    const url = 'https://www.youtube.com/channel/UC123';
    expect(youtubeEmbedUrl(url)).toBe(url);
  });
});

describe('vimeoEmbedUrl', () => {
  it('converts a vimeo.com page URL to a player embed URL', () => {
    expect(vimeoEmbedUrl('https://vimeo.com/123456789')).toBe(
      'https://player.vimeo.com/video/123456789',
    );
  });

  it('returns an already-canonical player URL unchanged', () => {
    const embed = 'https://player.vimeo.com/video/123456789';
    expect(vimeoEmbedUrl(embed)).toBe(embed);
  });

  it('returns the original URL when no numeric ID is found', () => {
    const url = 'https://vimeo.com/channels/staffpicks';
    expect(vimeoEmbedUrl(url)).toBe(url);
  });
});
