import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React, {useState} from 'react';

import SegmentedButtons, {
  SegmentedButtonsProps,
} from '@cdo/apps/componentLibrary/segmentedButtons';

describe('Design System - Segmented Buttons', () => {
  const renderSegmentedButtons = (props: Partial<SegmentedButtonsProps>) => {
    const Wrapper: React.FC = () => {
      const [selectedValue, setSelectedValue] = useState<string>(
        props.selectedButtonValue || 'label'
      );
      const handleChange = (value: string) => {
        setSelectedValue(value);
        props.onChange && props.onChange(value);
      };

      return (
        <SegmentedButtons
          {...props}
          buttons={props.buttons || []}
          selectedButtonValue={selectedValue}
          onChange={handleChange}
        />
      );
    };

    return render(<Wrapper />);
  };

  it('renders with correct button labels', () => {
    renderSegmentedButtons({
      buttons: [
        {label: 'Label', value: 'label'},
        {label: 'Label2', value: 'label-2'},
      ],
    });

    const segmentedButton1 = screen.getByText('Label');
    const segmentedButton2 = screen.getByText('Label2');

    expect(segmentedButton1).toBeInTheDocument();
    expect(segmentedButton2).toBeInTheDocument();
  });

  it('changes selected button on click', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    renderSegmentedButtons({
      buttons: [
        {label: 'Label', value: 'label'},
        {label: 'Label2', value: 'label-2'},
      ],
      onChange: spyOnChange,
    });

    const segmentedButton1 = screen.getByText('Label');
    const segmentedButton2 = screen.getByText('Label2');

    // Initial state
    expect(segmentedButton1).toBeInTheDocument();
    expect(segmentedButton2).toBeInTheDocument();

    // Click the second button
    await user.click(segmentedButton2);

    // Validate the change handler and selected state
    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(spyOnChange).toHaveBeenCalledWith('label-2');

    // Click the first button
    await user.click(segmentedButton1);

    // Validate the change handler and selected state
    expect(spyOnChange).toHaveBeenCalledTimes(2);
    expect(spyOnChange).toHaveBeenCalledWith('label');
  });

  it("renders disabled button, doesn't change on click", async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    renderSegmentedButtons({
      buttons: [
        {label: 'Label', value: 'label'},
        {label: 'Label2', value: 'label-2', disabled: true},
      ],
      onChange: spyOnChange,
    });

    const segmentedButton1 = screen.getByText('Label');
    const segmentedButton2 = screen.getByText('Label2');

    // Initial state
    expect(segmentedButton1).toBeInTheDocument();
    expect(segmentedButton2).toBeInTheDocument();

    // Click the disabled button
    await user.click(segmentedButton2);

    // Validate no change handler call
    expect(spyOnChange).not.toHaveBeenCalled();

    // Click the enabled button
    await user.click(segmentedButton1);

    // Validate the change handler call
    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(spyOnChange).toHaveBeenCalledWith('label');
  });
});
