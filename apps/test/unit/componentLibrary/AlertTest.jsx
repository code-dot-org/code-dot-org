import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import sinon from 'sinon';

import Alert from '@cdo/apps/componentLibrary/alert';

import {expect} from '../../util/reconfiguredChai';

describe('Design System - Alert', () => {
  it('Alert - renders with correct text', () => {
    render(<Alert text="Alert text" />);

    expect(screen.getByText('Alert text')).to.exist;
  });

  it('Alert - renders icon when passed', () => {
    const icon = {iconName: 'check-circle'};
    render(<Alert text="Alert text" icon={icon} />);

    const iconElement = screen.getByTestId('font-awesome-v6-icon');
    expect(iconElement).to.exist;
    expect(iconElement.className).to.contain('fa-check-circle');
  });

  it('Alert - renders default icon for specific types', () => {
    const {rerender} = render(<Alert text="Success Alert" type="success" />);
    expect(screen.getByTestId('font-awesome-v6-icon').className).to.contain(
      'fa-check-circle'
    );

    rerender(<Alert text="Danger Alert" type="danger" />);
    expect(screen.getByTestId('font-awesome-v6-icon').className).to.contain(
      'fa-circle-xmark'
    );

    rerender(<Alert text="Warning Alert" type="warning" />);
    expect(screen.getByTestId('font-awesome-v6-icon').className).to.contain(
      'fa-exclamation-circle'
    );

    rerender(<Alert text="Info Alert" type="info" />);
    expect(screen.getByTestId('font-awesome-v6-icon').className).to.contain(
      'fa-circle-info'
    );
  });

  it('Alert - renders link correctly', () => {
    const link = {href: 'https://google.com/', children: 'Click here'};
    render(<Alert text="Alert with link" link={link} />);

    const linkElement = screen.getByText('Click here');
    expect(linkElement).to.exist;
    expect(linkElement.href).to.equal(link.href);
  });

  it('Alert - calls onClose', async () => {
    const user = userEvent.setup();
    const spyOnClose = sinon.spy();

    render(<Alert text="Closable Alert" onClose={spyOnClose} />);

    const closeButton = screen.getByText('x');
    await user.click(closeButton);

    expect(spyOnClose).to.have.been.calledOnce;
  });

  it('Alert - renders icon, text, link, and onClose at the same time', async () => {
    const user = userEvent.setup();
    const spyOnClose = sinon.spy();
    const link = {href: 'https://google.com/', children: 'Click here'};
    const icon = {iconName: 'check-circle'};

    render(
      <Alert
        text="Full Alert"
        icon={icon}
        link={link}
        onClose={spyOnClose}
        type="success"
      />
    );

    expect(screen.getByText('Full Alert')).to.exist;
    expect(screen.getByText('Click here')).to.exist;
    expect(screen.getByTestId('font-awesome-v6-icon').className).to.contain(
      'fa-check-circle'
    );

    const closeButton = screen.getByRole('button', {name: /x/i});
    await user.click(closeButton);

    expect(spyOnClose).to.have.been.calledOnce;
  });
});
