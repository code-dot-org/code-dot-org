import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import '@testing-library/jest-dom';
import Slider, {SliderProps} from '@cdo/apps/componentLibrary/slider';

describe('Slider Component', () => {
  const renderComponent = (props: Partial<SliderProps> = {}) => {
    return render(
      <Slider name="test-slider" onChange={() => {}} value={50} {...props} />
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
    const handleChange = jest.fn();

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
      />
    );

    // Get the slider element
    const slider = screen.getByRole('slider');

    // Change the slider value using fireEvent
    fireEvent.change(slider, {target: {value: 70}});

    // Check that the handler was called
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({target: expect.objectContaining({value: '70'})})
    );
  });

  it('displays percentage value correctly in percent mode', () => {
    renderComponent({isPercentMode: true});

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  // TODO: Uncomment when working on adding steps support OR working on adding center mark
  // it('supports centered mode and displays the correct fill direction', () => {
  //   renderComponent({isCentered: true, minValue: -100, maxValue: 100});
  //
  //   const slider = screen.getByRole('slider');
  //   expect(slider).toHaveAttribute('value', '50');
  //
  //   // Check that the center mark is rendered correctly
  //   const centerMark = screen.getByTestId('slider-center-mark');
  //   expect(centerMark).toBeInTheDocument();
  //   expect(centerMark).toHaveStyle('left: calc(50% - 1px)');
  // });

  it('supports RTL mode and mirrors the background gradient', () => {
    renderComponent({isRtl: true});

    const slider = screen.getByRole('slider');
    expect(slider).toHaveStyle('background: linear-gradient(to left,');
  });

  it('buttons increment and decrement value correctly', async () => {
    const handleChange = jest.fn();
    renderComponent({
      onChange: handleChange,
      leftButtonProps: {icon: {iconName: 'minus'}, 'aria-label': 'Decrease'},
      rightButtonProps: {icon: {iconName: 'plus'}, 'aria-label': 'Increase'},
    });

    const leftButton = screen.getByLabelText('Decrease');
    const rightButton = screen.getByLabelText('Increase');

    await userEvent.click(leftButton);
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({target: {value: '49'}})
    );

    await userEvent.click(rightButton);
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({target: {value: '51'}})
    );
  });

  it('disables interactions when disabled prop is set', async () => {
    const handleChange = jest.fn();
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

  // TODO: Uncomment this test once we have a solution for snapping to steps
  // it('handles snapping to steps correctly', async () => {
  //   const handleChange = jest.fn();
  //   renderComponent({
  //     onChange: handleChange,
  //     steps: [0, 25, 50, 75, 100],
  //     value: 25,
  //   });
  //
  //   const slider = screen.getByRole('slider');
  //   await userEvent.type(slider, '35');
  //
  //   expect(handleChange).toHaveBeenCalled();
  //   expect(slider).toHaveValue('25'); // Should snap back to nearest step
  // });
  //
  // it('renders correctly with step marks when steps are provided', () => {
  //   renderComponent({steps: [0, 25, 50, 75, 100], value: 50});
  //
  //   const stepMarks = screen.getAllByTestId('step-mark');
  //   expect(stepMarks.length).toBe(5); // Should render 5 step marks
  // });
});
