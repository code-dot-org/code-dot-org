import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {vi} from 'vitest';

import '@testing-library/jest-dom';
import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import Slider, {SliderProps} from '../index';

describe('Slider Component', () => {
  const renderComponent = (props: Partial<SliderProps> = {}) => {
    return render(
      <Slider name="test-slider" onChange={() => {}} value={50} {...props} />,
    );
  };

  it('renders correctly with basic props', () => {
    renderComponent({label: 'Test Slider'});

    const label = screen.getByText('Test Slider');
    const slider = screen.getByRole('slider');

    expect(label).toBeInTheDocument();
    expect(slider).toHaveAttribute('value', '50');
  });

  it('calls onChange when the slider value is changed using fireEvent.change', () => {
    const handleChange = vi.fn();

    // Render the Slider component
    render(
      <Slider
        name="test-slider"
        label="Test Slider"
        onChange={handleChange}
        value={50}
        step={10}
        minValue={0}
        maxValue={100}
      />,
    );

    // Get the slider element
    const slider = screen.getByRole('slider');

    // Change the slider value using fireEvent
    fireEvent.change(slider, {target: {value: 70}});

    // Check that the handler was called
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({target: expect.objectContaining({value: '70'})}),
    );
  });

  it('displays percentage value correctly in percent mode', () => {
    renderComponent({isPercentMode: true});

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  // TODO: write when steps support / center-mark land — see TODO in Slider.tsx
  it.todo('supports centered mode and displays the correct fill direction');

  it('supports RTL mode and mirrors the background gradient', () => {
    renderComponent({isRtl: true});

    const slider = screen.getByRole('slider');
    expect(slider).toHaveStyle('background: linear-gradient(to left,');
  });

  it('buttons increment and decrement value correctly', async () => {
    const handleChange = vi.fn();
    renderComponent({
      onChange: handleChange,
      leftButtonProps: {
        children: (
          <FontAwesomeV6Icon
            iconName="minus"
            title="Decrease"
            aria-label="Decrease"
          />
        ),
      },
      rightButtonProps: {
        children: (
          <FontAwesomeV6Icon
            iconName="plus"
            title="Increase"
            aria-label="Increase"
          />
        ),
      },
    });

    const leftButton = screen.getByLabelText('Decrease');
    const rightButton = screen.getByLabelText('Increase');

    await userEvent.click(leftButton);
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({target: {value: '49'}}),
    );

    await userEvent.click(rightButton);
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({target: {value: '51'}}),
    );
  });

  it('disables interactions when disabled prop is set', async () => {
    const handleChange = vi.fn();
    renderComponent({disabled: true, onChange: handleChange});

    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();
  });

  it('renders dynamic colors based on the color prop', () => {
    renderComponent({color: 'brand'});

    const slider = screen.getByRole('slider');
    expect(slider).toHaveStyle('background: linear-gradient(to right,');
  });

  it('supports custom minValue and maxValue', () => {
    renderComponent({minValue: 10, maxValue: 90});

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('min', '10');
    expect(slider).toHaveAttribute('max', '90');
  });

  // TODO: write when the `steps` prop lands — see TODO in Slider.tsx
  it.todo('handles snapping to steps correctly');
  it.todo('renders correctly with step marks when steps are provided');
});
