import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import IntroScreenCard from '@cdo/apps/quiz/builder/IntroScreenCard';

const INTRO_TEXT = 'This exam covers Units 1 to 3. You have 45 minutes.';

function renderCard(
  overrides: Partial<React.ComponentProps<typeof IntroScreenCard>> = {}
) {
  const onSave = jest.fn().mockResolvedValue(undefined);
  render(
    <IntroScreenCard
      customIntroText={INTRO_TEXT}
      hasTimeLimit={false}
      onSave={onSave}
      {...overrides}
    />
  );
  return {onSave};
}

function expand() {
  fireEvent.click(screen.getByRole('button', {name: 'Edit intro screen'}));
}

describe('IntroScreenCard', () => {
  it('previews the content while collapsed, without the editor', () => {
    renderCard();
    expect(screen.getByText(INTRO_TEXT)).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('edits the content in a textarea and saves it as customIntroText, then collapses', async () => {
    const {onSave} = renderCard();
    expand();

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue(INTRO_TEXT);
    expect(screen.getByRole('button', {name: 'Save'})).toBeDisabled();

    fireEvent.change(textarea, {target: {value: '# Welcome'}});
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({customIntroText: '# Welcome'})
    );
    await waitFor(() =>
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    );
    expect(
      screen.getByRole('button', {name: 'Edit intro screen'})
    ).toHaveFocus();
  });

  it('discards unsaved changes', () => {
    renderCard();
    expand();

    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'Edited'}});
    expect(screen.getByLabelText('Unsaved changes')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Discard changes'}));

    expect(screen.getByRole('textbox')).toHaveValue(INTRO_TEXT);
    expect(screen.queryByLabelText('Unsaved changes')).not.toBeInTheDocument();
  });

  it('shows the error and keeps the edit open when saving fails', async () => {
    const onSave = jest.fn().mockRejectedValue(new Error('boom'));
    renderCard({onSave});
    expand();

    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'Edited'}});
    fireEvent.click(screen.getByRole('button', {name: 'Save'}));

    expect(
      await screen.findByText('Something went wrong.')
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Edited');
  });

  it('turns the intro screen off when removed from the quiz', async () => {
    const {onSave} = renderCard();
    expand();

    fireEvent.click(screen.getByRole('button', {name: 'Remove from quiz'}));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({showIntroScreen: false})
    );
  });

  it('refuses to remove the intro screen while a time limit is set', () => {
    const {onSave} = renderCard({hasTimeLimit: true});
    expand();

    fireEvent.click(screen.getByRole('button', {name: 'Remove from quiz'}));

    expect(onSave).not.toHaveBeenCalled();
    expect(
      screen.getByText(/Remove the time limit in Configuration/)
    ).toBeInTheDocument();
  });
});
