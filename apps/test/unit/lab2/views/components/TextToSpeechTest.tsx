import {render, screen} from '@testing-library/react';
import React from 'react';

import TextToSpeech from '@cdo/apps/lab2/views/components/TextToSpeech';
import localization from '@cdo/apps/localization';

jest.mock('@cdo/apps/dcdo', () => ({
  __esModule: true,
  default: {get: () => true},
}));

jest.mock('@cdo/apps/sharedComponents/BrowserTextToSpeechWrapper', () => ({
  useBrowserTextToSpeech: () => ({
    isTtsAvailable: true,
    speak: jest.fn(),
    cancel: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
  }),
}));

const QUEST_BUILDER = '/courses/quest-builder-2026/units/1/lessons/1/levels/2';

function renderAt(path: string, locale: string) {
  window.history.pushState({}, '', path);
  jest.spyOn(localization, 'locale', 'get').mockReturnValue(locale);
  render(<TextToSpeech text="Try a quest" />);
  return screen.queryByRole('button', {name: /text-to-speech/i});
}

afterEach(() => {
  jest.restoreAllMocks();
  window.history.pushState({}, '', '/');
});

describe('TextToSpeech', () => {
  it('is offered in English in quest-builder-2026', () => {
    expect(renderAt(QUEST_BUILDER, 'en-US')).not.toBeNull();
  });

  it('is not offered in another language in quest-builder-2026', () => {
    expect(renderAt(QUEST_BUILDER, 'es-MX')).toBeNull();
  });

  it('is not offered under a locale prefix in another language', () => {
    expect(renderAt(`/es${QUEST_BUILDER}`, 'es')).toBeNull();
  });

  it('is offered in another language in other units', () => {
    expect(
      renderAt('/courses/mix-move-ai-2025/units/1/lessons/1/levels/2', 'es-MX')
    ).not.toBeNull();
  });

  it('is not confused by a unit whose name starts the same', () => {
    expect(
      renderAt(
        '/courses/quest-builder-2026-pilot/units/1/lessons/1/levels/2',
        'es-MX'
      )
    ).not.toBeNull();
  });
});
