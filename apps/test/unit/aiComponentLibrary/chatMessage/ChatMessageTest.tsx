import {render, screen} from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom';
import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';

const renderAssistantMessage = (text: string) =>
  render(<ChatMessage role={Role.ASSISTANT} text={text} />);

describe('ChatMessage', () => {
  it('renders a reply that quotes an unparseable style, without styles', () => {
    renderAssistantMessage(
      'Use <p style="color: red;">Red</p> like <code><p style="..."></code>'
    );

    expect(screen.getByText('Red')).not.toHaveAttribute('style');
  });

  it('opens links in a new tab', () => {
    renderAssistantMessage('[Docs](https://example.com)');

    const link = screen.getByRole('link', {name: 'Docs'});
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('gives code blocks a copy button', () => {
    renderAssistantMessage('```\nprint("hi")\n```');

    expect(screen.getByRole('button', {name: 'Copy code'})).toBeInTheDocument();
    expect(screen.getByText('print("hi")')).toBeInTheDocument();
  });

  it('keeps replies away from the page translator', () => {
    renderAssistantMessage('Hello');

    expect(
      screen.getByText('Hello').closest('[data-notranslate]')
    ).not.toBeNull();
  });
});
