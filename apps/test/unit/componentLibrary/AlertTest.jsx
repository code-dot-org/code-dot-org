import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import Alert from '@cdo/apps/componentLibrary/alert';

describe('Design System - Alert', () => {
  it('Alert - renders with correct text', () => {
    render(<Alert text="Alert text" />);

    expect(screen.getByText('Alert text')).toBeDefined();
  });

  it('Alert - renders icon when passed', () => {
    const icon = {iconName: 'check-circle'};
    render(<Alert text="Alert text" icon={icon} />);

    const iconElement = screen.getByTestId('font-awesome-v6-icon');
    expect(iconElement).toBeDefined();
    expect(iconElement.className).toContain('fa-check-circle');
  });

  it('Alert - renders default icon for specific types', () => {
    const {rerender} = render(<Alert text="Success Alert" type="success" />);
    expect(screen.getByTestId('font-awesome-v6-icon').className).toContain(
      'fa-check-circle'
    );

    rerender(<Alert text="Danger Alert" type="danger" />);
    expect(screen.getByTestId('font-awesome-v6-icon').className).toContain(
      'fa-circle-xmark'
    );

    rerender(<Alert text="Warning Alert" type="warning" />);
    expect(screen.getByTestId('font-awesome-v6-icon').className).toContain(
      'fa-exclamation-circle'
    );

    rerender(<Alert text="Info Alert" type="info" />);
    expect(screen.getByTestId('font-awesome-v6-icon').className).toContain(
      'fa-circle-info'
    );
  });

  it('Alert - renders link correctly', () => {
    const link = {href: 'https://google.com/', children: 'Click here'};
    render(<Alert text="Alert with link" link={link} />);

    const linkElement = screen.getByText('Click here');
    expect(linkElement).toBeDefined();
    expect(linkElement.href).toBe(link.href);
  });

  it('Alert - calls onClose', async () => {
    const user = userEvent.setup();
    const spyOnClose = jest.fn();

    render(<Alert text="Closable Alert" onClose={spyOnClose} />);

    const closeButton = screen.getByRole('button', {name: 'Close alert'});
    await user.click(closeButton);

    expect(spyOnClose).toHaveBeenCalledTimes(1);
  });

  it('Alert - renders icon, text, link, and onClose at the same time', async () => {
    const user = userEvent.setup();
    const spyOnClose = jest.fn();
    const link = {href: 'https://google.com/', children: 'Click here'};
    const icon = {iconName: 'check-circle'};

    const {container} = render(
      <Alert
        text="Full Alert"
        icon={icon}
        link={link}
        onClose={spyOnClose}
        type="success"
      />
    );

    const iconElement = container.querySelector('.fa-check-circle');

    expect(screen.getByText('Full Alert')).toBeDefined();
    expect(screen.getByText('Click here')).toBeDefined();
    expect(iconElement).toBeDefined();

    const closeButton = screen.getByRole('button', {name: 'Close alert'});
    await user.click(closeButton);

    expect(spyOnClose).toHaveBeenCalledTimes(1);
  });
});
