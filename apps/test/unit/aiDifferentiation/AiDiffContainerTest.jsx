import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import AiDiffContainer from '@cdo/apps/aiDifferentiation/AiDiffContainer';

jest.mock('@react-pdf/renderer', () => {
  return {
    PDFDownloadLink: () => null,
    StyleSheet: {
      create: () => null,
    },
  };
});

const defaultProps = {
  closeTutor: () => {},
  open: true,
  lessonId: 2,
  lessonName: 'test_lesson',
  unitDisplayName: 'test unit name',
};

describe('AiDiffContainer', () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = () => {};
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.restoreAllMocks();
  });

  it('visible when open', () => {
    render(<AiDiffContainer {...defaultProps} />);
    expect(screen.getByText('AI Teaching Assistant')).toBeVisible();
  });

  it('moves rubric container when user clicks and drags component', () => {
    const {getByTestId} = render(<AiDiffContainer {...defaultProps} />);
    const handle_element = screen.getByText('AI Teaching Assistant');
    const element = getByTestId('draggable-test-id');

    const initialPosition = element.style.transform;

    // simulate dragging
    fireEvent.mouseDown(handle_element, {clientX: 0, clientY: 0});
    fireEvent.mouseMove(handle_element, {clientX: 100, clientY: 100});
    fireEvent.mouseUp(handle_element);

    const newPosition = element.style.transform;

    expect(newPosition).not.toEqual(initialPosition);
  });
});
