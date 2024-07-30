import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import AdvancedSettingToggles from '@cdo/apps/templates/sectionsRefresh/AdvancedSettingToggles';
import i18n from '@cdo/locale';

describe('AdvancedSettingToggles', () => {
  it('renders PairProgramming and LockThisSection toggles to true and false as default respectively', () => {
    render(
      <AdvancedSettingToggles
        updateSection={() => {}}
        section={{pairingAllowed: true, restrictSection: false}}
      />
    );
    const pairingToggle = screen.getByLabelText(i18n.pairProgramming());
    expect(pairingToggle).toHaveAttribute('checked');
    const lockToggle = screen.getByLabelText(i18n.restrictSectionAccess());
    expect(lockToggle).not.toHaveAttribute('checked');
    // Check that the other toggles do not appear.
    const ttsToggle = screen.queryByText(i18n.enableTtsAutoplayToggle());
    expect(ttsToggle).toBeNull();
    const lessonExtrasToggle = screen.queryByText(
      i18n.enableLessonExtrasToggle()
    );
    expect(lessonExtrasToggle).toBeNull();
    const aiTutorToggle = screen.queryByText(i18n.enableAITutor());
    expect(aiTutorToggle).toBeNull();
  });

  it('renders Lesson Extras toggle when available, enabled', () => {
    render(
      <AdvancedSettingToggles
        updateSection={() => {}}
        section={{
          lessonExtras: true,
        }}
        hasLessonExtras={true}
      />
    );
    const lessonExtrasToggle = screen.getByLabelText(
      i18n.enableLessonExtrasToggle()
    );
    expect(lessonExtrasToggle).toHaveAttribute('checked');
  });

  it('renders TTS toggle when available, disabled', () => {
    render(
      <AdvancedSettingToggles
        updateSection={() => {}}
        section={{
          ttsAutoplayEnabled: false,
        }}
        hasTextToSpeech={true}
      />
    );
    const ttsToggle = screen.getByLabelText(i18n.enableTtsAutoplayToggle());
    expect(ttsToggle).not.toHaveAttribute('checked');
  });

  it('renders enable AI Tutor toggle when available, enabled', () => {
    render(
      <AdvancedSettingToggles
        updateSection={() => {}}
        section={{
          aiTutorEnabled: true,
        }}
        aiTutorAvailable={true}
      />
    );
    const aiTutorToggle = screen.getByLabelText(i18n.enableAITutor());
    expect(aiTutorToggle).toHaveAttribute('checked');
  });
});
