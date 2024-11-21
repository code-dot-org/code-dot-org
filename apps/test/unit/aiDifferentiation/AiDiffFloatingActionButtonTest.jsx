import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import AiDiffFloatingActionButton from '@cdo/apps/aiDifferentiation/AiDiffFloatingActionButton';
import i18n from '@cdo/locale';

// import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

jest.mock('@react-pdf/renderer', () => {
  return {
    PDFDownloadLink: () => null,
    StyleSheet: {
      create: () => null,
    },
  };
});

const defaultProps = {
  lessonId: 1,
  lessonName: 'test_lesson',
  unitDisplayName: 'test unit name',
};

describe('AIDiffFloatingActionButton', () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = () => {};
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('begins closed', () => {
    render(<AiDiffFloatingActionButton />);
    expect(screen.getByText('AI Teaching Assistant')).not.toBeVisible();
  });

  it('begins open if open set in session storage', () => {
    sessionStorage.setItem('AiDiffFabOpenStateKey', 'true');
    render(<AiDiffFloatingActionButton />);
    expect(screen.getByText('AI Teaching Assistant')).toBeVisible();
  });

  it('opens on click', () => {
    render(<AiDiffFloatingActionButton />);
    fireEvent.click(
      screen.getByRole('button', {name: i18n.openOrCloseTeachingAssistant()})
    );
    expect(screen.getByText('AI Teaching Assistant')).toBeVisible();
  });

  describe('pulse animation', () => {
    it('renders pulse animation when session storage is empty', () => {
      render(<AiDiffFloatingActionButton {...defaultProps} />);
      const fab = screen.getByRole('button', {
        name: i18n.openOrCloseTeachingAssistant(),
      });
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(false);

      const fabImage = screen.getByRole('img', {name: 'AI bot'});
      fireEvent.load(fabImage);
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(false);

      const taImage = screen.getByRole('img', {name: 'TA overlay'});
      fireEvent.load(taImage);
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(true);
    });

    it('does not render pulse animation when open state is present in session storage', () => {
      sessionStorage.setItem('AiDiffFabOpenStateKey', 'false');
      render(<AiDiffFloatingActionButton {...defaultProps} />);
      const image = screen.getByRole('img', {name: 'AI bot'});
      fireEvent.load(image);
      const taImage = screen.getByRole('img', {name: 'TA overlay'});
      fireEvent.load(taImage);
      const fab = screen.getByRole('button', {
        name: i18n.openOrCloseTeachingAssistant(),
      });
      expect(fab.classList.contains('unittest-fab-pulse')).toBe(false);
    });
  });
});
