import {ThemeProvider} from '@mui/material';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import {CdoTheme} from '@/themes';

import NotificationBanner from '../NotificationBanner';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={CdoTheme}>{component}</ThemeProvider>);
};

describe('Design System - NotificationBanner', () => {
  const defaultProps = {
    variant: 'info' as const,
    title: 'Test Title',
    description: 'Test description',
    icon: {iconName: 'circle-info', iconStyle: 'solid' as const},
  };

  it('renders with correct title and description', () => {
    renderWithTheme(<NotificationBanner {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders icon correctly', () => {
    renderWithTheme(<NotificationBanner {...defaultProps} />);
    const icon = screen.getByTestId('font-awesome-v6-icon');
    expect(icon).toBeInTheDocument();
    expect(icon.className).toContain('fa-circle-info');
  });

  it('renders children when provided instead of description', () => {
    renderWithTheme(
      <NotificationBanner
        {...defaultProps}
        description={undefined}
        children={<div>Custom children content</div>}
      />,
    );
    expect(screen.getByText('Custom children content')).toBeInTheDocument();
    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    renderWithTheme(
      <NotificationBanner
        {...defaultProps}
        actions={<button>Action Button</button>}
      />,
    );
    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });

  it('renders close button when onClose is provided', () => {
    const onClose = jest.fn();
    renderWithTheme(<NotificationBanner {...defaultProps} onClose={onClose} />);
    const closeButton = screen.getByRole('button', {
      name: 'Close notification',
    });
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    renderWithTheme(<NotificationBanner {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByRole('button', {
      name: 'Close notification',
    });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render close button when onClose is not provided', () => {
    renderWithTheme(<NotificationBanner {...defaultProps} />);
    expect(
      screen.queryByRole('button', {name: 'Close notification'}),
    ).not.toBeInTheDocument();
  });

  it('renders with correct role attribute', () => {
    const {rerender} = renderWithTheme(
      <NotificationBanner {...defaultProps} role="status" />,
    );
    let banner = screen.getByRole('status');
    expect(banner).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={CdoTheme}>
        <NotificationBanner {...defaultProps} role="alert" />
      </ThemeProvider>,
    );
    banner = screen.getByRole('alert');
    expect(banner).toBeInTheDocument();
  });

  it('sets aria-live based on role', () => {
    const {rerender} = renderWithTheme(
      <NotificationBanner {...defaultProps} role="status" />,
    );
    let banner = screen.getByRole('status');
    expect(banner).toHaveAttribute('aria-live', 'polite');

    rerender(
      <ThemeProvider theme={CdoTheme}>
        <NotificationBanner {...defaultProps} role="alert" />
      </ThemeProvider>,
    );
    banner = screen.getByRole('alert');
    expect(banner).toHaveAttribute('aria-live', 'assertive');
  });

  it('renders all variants correctly', () => {
    const variants = [
      'primary',
      'brand',
      'info',
      'success',
      'warning',
      'error',
      'aqua',
      'gray',
    ] as const;

    variants.forEach(variant => {
      const {unmount} = renderWithTheme(
        <NotificationBanner {...defaultProps} variant={variant} />,
      );
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      unmount();
    });
  });

  it('renders both styles correctly', () => {
    const {rerender} = renderWithTheme(
      <NotificationBanner {...defaultProps} style="subtle" />,
    );
    let banner = screen.getByRole('status');
    expect(banner).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={CdoTheme}>
        <NotificationBanner {...defaultProps} style="filled" />
      </ThemeProvider>,
    );
    banner = screen.getByRole('status');
    expect(banner).toBeInTheDocument();
  });

  it('defaults to fullWidth true', () => {
    renderWithTheme(<NotificationBanner {...defaultProps} />);
    const banner = screen.getByRole('status');
    expect(banner).toHaveStyle({width: '100%'});
  });

  it('applies fullWidth when set to true', () => {
    renderWithTheme(<NotificationBanner {...defaultProps} fullWidth={true} />);
    const banner = screen.getByRole('status');
    expect(banner).toHaveStyle({width: '100%'});
  });

  it('applies auto width when fullWidth is false', () => {
    renderWithTheme(<NotificationBanner {...defaultProps} fullWidth={false} />);
    const banner = screen.getByRole('status');
    expect(banner).toHaveStyle({width: 'auto'});
  });

  it('applies custom className', () => {
    renderWithTheme(
      <NotificationBanner {...defaultProps} className="custom-class" />,
    );
    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('custom-class');
  });

  it('applies custom id', () => {
    renderWithTheme(<NotificationBanner {...defaultProps} id="custom-id" />);
    const banner = screen.getByRole('status');
    expect(banner).toHaveAttribute('id', 'custom-id');
  });

  it('renders multiple action buttons', () => {
    renderWithTheme(
      <NotificationBanner
        {...defaultProps}
        actions={
          <>
            <button>Button 1</button>
            <button>Button 2</button>
          </>
        }
      />,
    );
    expect(screen.getByText('Button 1')).toBeInTheDocument();
    expect(screen.getByText('Button 2')).toBeInTheDocument();
  });
});
