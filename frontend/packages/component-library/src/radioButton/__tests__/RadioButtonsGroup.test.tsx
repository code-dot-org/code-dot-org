import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ChangeEvent, useState} from 'react';
import '@testing-library/jest-dom';

import {RadioButtonsGroup, RadioButtonsGroupProps} from './../index';

const radioButtonsData = [
  {
    name: 'test-radioButton1',
    value: 'test-radioButton1',
    label: 'Radio Button1 label',
  },
  {
    name: 'test-radioButton2',
    value: 'test-radioButton2',
    label: 'Radio Button2 label',
  },
  {
    name: 'test-radioButton3',
    value: 'test-radioButton3',
    label: 'Radio Button3 label',
  },
];

describe('Design System - Radio Buttons Group', () => {
  const TestRadioButtonsGroup: React.FC<
    Partial<RadioButtonsGroupProps>
  > = props => {
    const [selectedValue, setSelectedValue] = useState<string | undefined>(
      props.defaultValue,
    );

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      setSelectedValue(e.target.value);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      props && props.onChange && props.onChange(e);
    };

    return (
      <RadioButtonsGroup
        radioButtons={radioButtonsData}
        defaultValue={selectedValue}
        onChange={handleChange}
        {...props}
      />
    );
  };

  it('renders with correct label and default selected radio', () => {
    render(<TestRadioButtonsGroup defaultValue="test-radioButton2" />);

    const radioButton1 = screen.getByDisplayValue(
      'test-radioButton1',
    ) as HTMLInputElement;
    const radioButton2 = screen.getByDisplayValue(
      'test-radioButton2',
    ) as HTMLInputElement;
    const radioButton3 = screen.getByDisplayValue(
      'test-radioButton3',
    ) as HTMLInputElement;

    expect(radioButton1).toBeInTheDocument();
    expect(radioButton2).toBeInTheDocument();
    expect(radioButton3).toBeInTheDocument();

    expect(screen.getByText(radioButtonsData[0].label)).toBeInTheDocument();
    expect(screen.getByText(radioButtonsData[1].label)).toBeInTheDocument();
    expect(screen.getByText(radioButtonsData[2].label)).toBeInTheDocument();

    expect(radioButton1.checked).toBe(false);
    expect(radioButton2.checked).toBe(true);
    expect(radioButton3.checked).toBe(false);
  });

  it('changes selected radio button on click', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    render(<TestRadioButtonsGroup onChange={spyOnChange} />);

    const radioButton1 = screen.getByDisplayValue(
      'test-radioButton1',
    ) as HTMLInputElement;
    const radioButton2 = screen.getByDisplayValue(
      'test-radioButton2',
    ) as HTMLInputElement;
    const radioButton3 = screen.getByDisplayValue(
      'test-radioButton3',
    ) as HTMLInputElement;

    expect(radioButton1.checked).toBe(false);
    expect(radioButton2.checked).toBe(false);
    expect(radioButton3.checked).toBe(false);

    await user.click(radioButton3);
    expect(spyOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({value: 'test-radioButton3'}),
      }),
    );
    expect(radioButton3.checked).toBe(true);

    await user.click(radioButton2);
    expect(spyOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({value: 'test-radioButton2'}),
      }),
    );
    expect(radioButton2.checked).toBe(true);
  });

  it('renders disabled radio buttons and prevents selection', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    const modifiedRadioButtonsData = [
      {...radioButtonsData[0], disabled: true},
      {...radioButtonsData[1], disabled: true},
      radioButtonsData[2],
    ];

    render(
      <TestRadioButtonsGroup
        radioButtons={modifiedRadioButtonsData}
        onChange={spyOnChange}
      />,
    );

    const radioButton1 = screen.getByDisplayValue(
      'test-radioButton1',
    ) as HTMLInputElement;
    const radioButton2 = screen.getByDisplayValue(
      'test-radioButton2',
    ) as HTMLInputElement;
    const radioButton3 = screen.getByDisplayValue(
      'test-radioButton3',
    ) as HTMLInputElement;

    expect(radioButton1.disabled).toBe(true);
    expect(radioButton2.disabled).toBe(true);
    expect(radioButton3.disabled).toBe(false);

    await user.click(radioButton1);
    await user.click(radioButton2);

    expect(spyOnChange).not.toHaveBeenCalled();

    await user.click(radioButton3);

    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(spyOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({value: 'test-radioButton3'}),
      }),
    );
    expect(radioButton3.checked).toBe(true);
  });
});
