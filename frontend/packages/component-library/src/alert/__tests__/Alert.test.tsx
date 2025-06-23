import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import Alert from './../index';

describe('Design System - Alert', () => {
  it('renders with correct text', () => {
    render(<Alert text="Alert text" />);
    expect(screen.getByText('Alert text')).toBeInTheDocument();
  });

  it('renders icon when passed', () => {
    const icon = {iconName: 'check-circle', title: 'Check Icon'};
    render(<Alert text="Alert text" icon={icon} />);

    const iconElement = screen.getByTitle('Check Icon');
    expect(iconElement).toBeInTheDocument();
  });

  it('renders default icon for specific types', () => {
    const {rerender} = render(<Alert text="Success Alert" type="success" />);
    // TODO [Design2-197] - Create a visual test for this case instead of checking for class name

    const successIcon = screen.getByTestId('font-awesome-v6-icon');
    expect(successIcon.className).toContain('fa-check-circle');

    rerender(<Alert text="Danger Alert" type="danger" />);
    // TODO [Design2-197] - Create a visual test for this case instead of checking for class name

    const dangerIcon = screen.getByTestId('font-awesome-v6-icon');
    expect(dangerIcon.className).toContain('fa-circle-xmark');

    rerender(<Alert text="Warning Alert" type="warning" />);
    // TODO [Design2-197] - Create a visual test for this case instead of checking for class name

    const warningIcon = screen.getByTestId('font-awesome-v6-icon');
    expect(warningIcon.className).toContain('fa-exclamation-circle');

    rerender(<Alert text="Info Alert" type="info" />);
    // TODO [Design2-197] - Create a visual test for this case instead of checking for class name

    const infoIcon = screen.getByTestId('font-awesome-v6-icon');
    expect(infoIcon.className).toContain('fa-circle-info');
  });

  it('renders link correctly', () => {
    const link = {href: 'https://google.com/', children: 'Click here'};
    render(<Alert text="Alert with link" link={link} />);

    const linkElement = screen.getByText('Click here') as HTMLAnchorElement;
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.href).toBe(link.href);
  });

  it('calls onClose', async () => {
    const user = userEvent.setup();
    const spyOnClose = jest.fn();

    render(<Alert text="Closable Alert" onClose={spyOnClose} />);

    const closeButton = screen.getByRole('button', {name: 'Close alert'});
    await user.click(closeButton);

    expect(spyOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders icon, text, link, and onClose at the same time', async () => {
    const user = userEvent.setup();
    const spyOnClose = jest.fn();
    const link = {href: 'https://google.com/', children: 'Click here'};
    const icon = {iconName: 'check-circle', title: 'Check Icon'};

    render(
      <Alert
        text="Full Alert"
        icon={icon}
        link={link}
        onClose={spyOnClose}
        type="success"
      />,
    );

    expect(screen.getByText('Full Alert')).toBeInTheDocument();
    expect(screen.getByText('Click here')).toBeInTheDocument();
    expect(screen.getByTitle('Check Icon')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', {name: 'Close alert'});
    await user.click(closeButton);

    expect(spyOnClose).toHaveBeenCalledTimes(1);
  });
});
