import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import type {EmailOptIn} from '@code-dot-org/core/api';

import EmailOptInField, {EMAIL_OPT_IN_REQUIRED} from '../EmailOptInField';

function renderField({
  value = '' as EmailOptIn,
  touched = false,
  onChange = vi.fn(),
  onTouched = vi.fn(),
} = {}) {
  render(
    <EmailOptInField
      value={value}
      onChange={onChange}
      touched={touched}
      onTouched={onTouched}
      disabled={false}
    />,
  );
  return {onChange, onTouched};
}

const group = () => screen.getByRole('radiogroup');
const radio = (answer: 'Yes' | 'No') =>
  screen.getByRole('radio', {name: answer});

describe('EmailOptInField', () => {
  it('should name the group by the question and keep the privacy link outside it', () => {
    renderField();
    expect(group()).toHaveAccessibleName(
      'Can we email you about updates to our courses, local opportunities, or other computer science news?',
    );
    expect(
      screen.getByRole('link', {name: '(See our privacy policy)'}),
    ).toHaveAttribute('href', expect.stringContaining('/privacy'));
  });

  it('should report the chosen answer', () => {
    const {onChange} = renderField();
    fireEvent.click(radio('No'));
    expect(onChange).toHaveBeenCalledWith('no');
  });

  it('should not show the required error before the question is touched', () => {
    renderField();
    expect(screen.queryByText(EMAIL_OPT_IN_REQUIRED)).not.toBeInTheDocument();
    expect(group()).not.toHaveAttribute('aria-invalid');
  });

  it('should show the required error as the group description when touched and unanswered', () => {
    renderField({touched: true});
    expect(screen.getByRole('alert')).toHaveTextContent(EMAIL_OPT_IN_REQUIRED);
    expect(group()).toHaveAccessibleDescription(EMAIL_OPT_IN_REQUIRED);
    expect(group()).toHaveAttribute('aria-invalid', 'true');
  });

  it('should hide the required error once answered even when touched', () => {
    renderField({touched: true, value: 'yes'});
    expect(screen.queryByText(EMAIL_OPT_IN_REQUIRED)).not.toBeInTheDocument();
  });

  it('should report touched when focus leaves the group', () => {
    const {onTouched} = renderField();
    fireEvent.blur(radio('No'), {
      relatedTarget: screen.getByRole('link', {name: /privacy/}),
    });
    expect(onTouched).toHaveBeenCalledTimes(1);
  });

  it('should not report touched when focus moves between the radios', () => {
    const {onTouched} = renderField();
    fireEvent.blur(radio('Yes'), {relatedTarget: radio('No')});
    expect(onTouched).not.toHaveBeenCalled();
  });
});
