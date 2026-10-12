import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import ContinueButton from '@cdo/apps/lab2/views/components/Instructions/ContinueButton';

jest.mock('@cdo/apps/codebridge/components/WithConditionalTooltip', () => ({
  __esModule: true,
  default: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

describe('ContinueButton', () => {
  it('calls onContinue when clicked', () => {
    const onContinue = jest.fn();
    render(<ContinueButton onContinue={onContinue}>Go</ContinueButton>);

    fireEvent.click(screen.getByRole('button'));

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when disabled and told to hide', () => {
    render(
      <ContinueButton onContinue={jest.fn()} disabled hideIfDisabled>
        Go
      </ContinueButton>
    );

    expect(screen.queryByRole('button')).toBeNull();
  });
});
