import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import sinon from 'sinon';

import {expect} from '../../util/reconfiguredChai';

import Toggle from '@cdo/apps/componentLibrary/toggle';

describe('Design System - Toggle', () => {
  it('Toggle - renders with correct label', () => {
    render(
      <Toggle name="test-toggle" value="test-toggle" label="Toggle label" />
    );

    const toggle = screen.getByDisplayValue('test-toggle');
    expect(toggle).to.exist;
    expect(screen.getByText('Toggle label')).to.exist;
  });

  it('Toggle - changes checked state on click', async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();

    let checked = false;
    const onChange = () => {
      checked = !checked;
      spyOnChange(checked);
    };

    // Initial render
    const {rerender} = render(
      <Toggle
        name="test-toggle"
        value="test-toggle"
        label="Toggle label"
        checked={checked}
        onChange={onChange}
      />
    );

    let toggle = screen.getByDisplayValue('test-toggle');

    expect(toggle).to.exist;
    expect(toggle.checked).to.be.false;
    expect(toggle.disabled).to.be.false;

    await user.click(toggle);

    // Re-render after user's first click
    rerender(
      <Toggle
        name="test-toggle"
        value="test-toggle"
        label="Toggle label"
        checked={checked}
        onChange={onChange}
      />
    );

    toggle = screen.getByDisplayValue('test-toggle');

    expect(spyOnChange).to.have.been.calledOnce;
    expect(spyOnChange).to.have.been.calledWith(true);
    expect(toggle.checked).to.be.true;
    expect(toggle.disabled).to.be.false;

    await user.click(toggle);

    // Re-render after user's second click
    rerender(
      <Toggle
        name="test-toggle"
        value="test-toggle"
        label="Toggle label"
        checked={checked}
        onChange={onChange}
      />
    );

    toggle = screen.getByDisplayValue('test-toggle');

    expect(spyOnChange).to.have.been.calledTwice;
    expect(toggle.checked).to.be.false;
    expect(toggle.disabled).to.be.false;
  });

  it("Toggle - renders disabled toggle, doesn't change on click", async () => {
    const user = userEvent.setup();
    const spyOnChange = sinon.spy();

    let checked = false;
    const onChange = () => {
      checked = !checked;
      spyOnChange(checked);
    };

    // Initial render
    const {rerender} = render(
      <Toggle
        name="test-toggle"
        value="test-toggle"
        label="Toggle label"
        checked={checked}
        onChange={onChange}
        disabled={true}
      />
    );

    let toggle = screen.getByDisplayValue('test-toggle');
    expect(toggle).to.exist;

    expect(toggle.checked).to.be.false;
    expect(toggle.disabled).to.be.true;

    await user.click(toggle);

    // Re-render after user's first click
    rerender(
      <Toggle
        name="test-toggle"
        value="test-toggle"
        label="Toggle label"
        checked={checked}
        onChange={onChange}
        disabled={true}
      />
    );

    toggle = screen.getByDisplayValue('test-toggle');

    expect(toggle.checked).to.be.false;
    expect(toggle.disabled).to.be.true;

    await user.click(toggle);

    // Re-render after user's second click
    rerender(
      <Toggle
        name="test-toggle"
        value="test-toggle"
        label="Toggle label"
        checked={checked}
        onChange={onChange}
        disabled={true}
      />
    );

    toggle = screen.getByDisplayValue('test-toggle');
    expect(toggle.checked).to.be.false;
    expect(toggle.disabled).to.be.true;
  });
});
