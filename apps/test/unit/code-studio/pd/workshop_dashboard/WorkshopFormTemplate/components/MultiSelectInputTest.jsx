import {act, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {MultiSelectInput} from '@cdo/apps/code-studio/pd/workshop_dashboard/WorkshopFormTemplate/components/MultiSelectInput';

const mockOptions = [
  {
    id: 1,
    searchText: ['Option 1', 'First option'],
    label: 'Option 1',
    secondaryLabel: 'First option description',
  },
  {
    id: 2,
    searchText: ['Option 2', 'Second option'],
    label: 'Option 2',
  },
  {
    id: 3,
    searchText: ['Option 3', 'Third option'],
    label: 'Option 3',
    secondaryLabel: 'Third option description',
  },
];

const [mockOption1, mockOption2, mockOption3] = mockOptions;

describe('MultiSelectInput', () => {
  const defaultProps = {
    label: 'Test Label',
    options: mockOptions,
    selectedOptions: [],
    setSelectedOptions: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const mockScrollIntoView = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
  });

  const getInputElement = () => screen.getByRole('combobox');
  const getMenuElement = () => screen.getByRole('listbox');
  const getOptionFromDropdown = optionText => {
    const listbox = getMenuElement();
    return within(listbox).getByText(optionText).closest('[role="option"]');
  };

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<MultiSelectInput {...defaultProps} />);

      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Filter options')).toBeInTheDocument();
    });

    it('uses custom id when provided', () => {
      render(<MultiSelectInput {...defaultProps} id="custom-id" />);

      const input = getInputElement();
      expect(input).toHaveAttribute('id', 'custom-id');
    });

    it('renders selected options as tags', () => {
      render(
        <MultiSelectInput
          {...defaultProps}
          selectedOptions={[mockOption1, mockOption3]}
        />
      );

      // Check if tags are rendered
      // Look for the tag container first
      const multiSelectContainer = screen.getByRole('combobox').parentNode;
      expect(
        within(multiSelectContainer).getByText('Option 1')
      ).toBeInTheDocument();
      expect(
        within(multiSelectContainer).getByText('Option 3')
      ).toBeInTheDocument();

      // The Tags component should render buttons to remove the tags
      const closeButtons = screen.getAllByRole('button', {name: /remove/i});
      expect(closeButtons).toHaveLength(2);
    });

    it('sets correct aria attributes for accessibility', () => {
      render(<MultiSelectInput {...defaultProps} id="test-multiselect" />);

      const combobox = screen.getByRole('combobox');
      expect(combobox).toHaveAttribute(
        'aria-controls',
        'test-multiselect-listbox'
      );
      expect(combobox).toHaveAttribute('aria-expanded', 'false');
      const popupContainer = combobox.closest('[aria-haspopup="listbox"]');
      expect(popupContainer).toBeInTheDocument();

      const input = getInputElement();
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
      expect(input).toHaveAttribute(
        'aria-controls',
        'test-multiselect-listbox'
      );
      expect(input).toHaveAttribute(
        'aria-labelledby',
        'test-multiselect-label'
      );
    });
  });

  describe('Click Interactions', () => {
    it('opens dropdown menu on input click', async () => {
      const user = userEvent.setup();
      render(<MultiSelectInput {...defaultProps} />);

      const input = getInputElement();
      await user.click(input);

      // Check if dropdown menu is opened
      const listbox = getMenuElement();
      expect(listbox).toBeInTheDocument();

      // Check if all options are displayed
      const options = within(listbox).getAllByRole('option');
      expect(options).toHaveLength(3);

      // Check for options within the listbox
      expect(getOptionFromDropdown('Option 1')).toBeInTheDocument();
      expect(getOptionFromDropdown('Option 2')).toBeInTheDocument();
      expect(getOptionFromDropdown('Option 3')).toBeInTheDocument();
    });

    it('selects an option on click', async () => {
      const mockSetSelectedOptions = jest.fn();
      const user = userEvent.setup();

      render(
        <MultiSelectInput
          {...defaultProps}
          setSelectedOptions={mockSetSelectedOptions}
        />
      );

      const input = getInputElement();
      await user.click(input);

      // Get the option from the dropdown specifically
      const option1 = getOptionFromDropdown('Option 1');
      await user.click(option1);

      // Check if setSelectedOptions was called with correct argument
      expect(mockSetSelectedOptions).toHaveBeenCalledWith([mockOption1]);
    });

    it('toggles option selection when already selected', async () => {
      const mockSetSelectedOptions = jest.fn();
      const user = userEvent.setup();

      render(
        <MultiSelectInput
          {...defaultProps}
          selectedOptions={[mockOption1, mockOption2]}
          setSelectedOptions={mockSetSelectedOptions}
        />
      );

      const input = getInputElement();
      await user.click(input);

      // Get the option from the dropdown specifically
      const option1 = getOptionFromDropdown('Option 1');
      await user.click(option1);

      // Check if setSelectedOptions was called to remove the option
      expect(mockSetSelectedOptions).toHaveBeenCalledWith([mockOption2]);
    });

    it('removes option when tag close button is clicked', async () => {
      const mockSetSelectedOptions = jest.fn();
      const user = userEvent.setup();

      render(
        <MultiSelectInput
          {...defaultProps}
          selectedOptions={[mockOption1, mockOption3]}
          setSelectedOptions={mockSetSelectedOptions}
        />
      );

      // Find the close button for Option 1
      const closeButton = screen.getByRole('button', {
        name: /remove option 1/i,
      });
      await user.click(closeButton);

      // Check if setSelectedOptions was called with correct argument
      expect(mockSetSelectedOptions).toHaveBeenCalledWith([mockOption3]);
    });

    it('clears all selected options when clear all button is clicked', async () => {
      const mockSetSelectedOptions = jest.fn();
      const user = userEvent.setup();

      render(
        <MultiSelectInput
          {...defaultProps}
          selectedOptions={[mockOption1, mockOption3]}
          setSelectedOptions={mockSetSelectedOptions}
        />
      );

      // Find the clear all button
      const clearButton = screen.getByRole('button', {
        name: /clear all selected options/i,
      });
      await user.click(clearButton);

      // Check if setSelectedOptions was called with empty array
      expect(mockSetSelectedOptions).toHaveBeenCalledWith([]);
    });

    it('focuses input when clicking on the label', async () => {
      const user = userEvent.setup();
      render(<MultiSelectInput {...defaultProps} />);

      const label = screen.getByText('Test Label');
      await user.click(label);

      // Check if input is focused
      expect(getInputElement()).toHaveFocus();
    });

    it('updates aria-expanded when dropdown opens and closes', async () => {
      const user = userEvent.setup();
      render(<MultiSelectInput {...defaultProps} />);

      const combobox = screen.getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-expanded', 'false');

      const input = getInputElement();
      await user.click(input);

      expect(combobox).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard('{Escape}');

      expect(combobox).toHaveAttribute('aria-expanded', 'false');
    });

    it('closes the dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      // Render an element outside the MultiSelectInput to click on
      render(
        <div>
          <MultiSelectInput {...defaultProps} />
          <div>Outside Element</div>
        </div>
      );

      // Open the dropdown
      await user.click(getInputElement());
      expect(getMenuElement()).toBeInTheDocument();

      // Click the outside element
      const outsideElement = screen.getByText('Outside Element');

      await act(async () => {
        await user.click(outsideElement);
      });

      // Check if the dropdown is closed
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Interactions', () => {
    it('opens dropdown menu on arrow down or up', async () => {
      const user = userEvent.setup();
      render(<MultiSelectInput {...defaultProps} />);

      await user.tab();
      await user.keyboard('{ArrowDown}');

      // Check if dropdown menu is opened
      const listbox = getMenuElement();
      expect(listbox).toBeInTheDocument();

      // Check if all options are displayed
      const options = within(listbox).getAllByRole('option');
      expect(options).toHaveLength(3);

      // Check for options within the listbox
      expect(getOptionFromDropdown('Option 1')).toBeInTheDocument();
      expect(getOptionFromDropdown('Option 2')).toBeInTheDocument();
      expect(getOptionFromDropdown('Option 3')).toBeInTheDocument();
    });

    it('selects an active option on Enter or Space', async () => {
      const mockSetSelectedOptions = jest.fn();
      const user = userEvent.setup();

      render(
        <MultiSelectInput
          {...defaultProps}
          setSelectedOptions={mockSetSelectedOptions}
        />
      );

      await user.tab();

      // focus on first menu option
      await user.keyboard('{ArrowDown}');

      // press Enter
      await user.keyboard('{Enter}');

      expect(mockSetSelectedOptions).toHaveBeenCalledTimes(1);

      expect(mockSetSelectedOptions).toHaveBeenCalledWith([mockOption1]);

      // focus on second menu option
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');

      // press Space
      await user.keyboard(' ');

      expect(mockSetSelectedOptions).toHaveBeenCalledWith([mockOption2]);
    });

    it('selects first option on Enter key when filtering', async () => {
      const mockSetSelectedOptions = jest.fn();
      const user = userEvent.setup();

      render(
        <MultiSelectInput
          {...defaultProps}
          setSelectedOptions={mockSetSelectedOptions}
        />
      );

      const input = getInputElement();
      await user.click(input);
      await user.type(input, 'First');
      await user.keyboard('{Enter}');

      // Check if setSelectedOptions was called with correct argument
      expect(mockSetSelectedOptions).toHaveBeenCalledWith([mockOption1]);
    });

    it('closes dropdown on Escape key', async () => {
      const user = userEvent.setup();
      render(<MultiSelectInput {...defaultProps} />);

      const input = getInputElement();
      await user.click(input);

      // Check if dropdown is open
      expect(getMenuElement()).toBeInTheDocument();

      await user.keyboard('{Escape}');

      // Check if dropdown is closed
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('closes dropdown on Tab key if no selected options', async () => {
      const user = userEvent.setup();
      render(<MultiSelectInput {...defaultProps} />);

      const input = getInputElement();
      await user.click(input);

      // Check if dropdown is open
      expect(getMenuElement()).toBeInTheDocument();

      await user.keyboard('{Tab}');

      // Check if dropdown is closed
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('removes last selected option on Backspace when input is empty', async () => {
      const mockSetSelectedOptions = jest.fn();
      const user = userEvent.setup();

      render(
        <MultiSelectInput
          {...defaultProps}
          selectedOptions={[mockOption1, mockOption3]}
          setSelectedOptions={mockSetSelectedOptions}
        />
      );

      const input = getInputElement();
      await user.click(input);
      await user.keyboard('{Backspace}');

      // Check if setSelectedOptions was called to remove the last option
      expect(mockSetSelectedOptions).toHaveBeenCalledWith([mockOption1]);
    });

    it('does not remove last selected option on Backspace when input is not empty', async () => {
      const mockSetSelectedOptions = jest.fn();
      const user = userEvent.setup();

      render(
        <MultiSelectInput
          {...defaultProps}
          selectedOptions={[mockOption1, mockOption3]}
          setSelectedOptions={mockSetSelectedOptions}
        />
      );

      const input = getInputElement();
      await user.click(input);
      await user.type(input, 'a');
      await user.keyboard('{Backspace}');

      // Check if setSelectedOptions was called to remove the last option
      expect(mockSetSelectedOptions).not.toHaveBeenCalled();
    });

    it('does not close the dropdown when tabbing through the options', async () => {
      const user = userEvent.setup();
      render(<MultiSelectInput {...defaultProps} />);

      await user.click(getInputElement());

      // Check if dropdown menu is opened
      const listbox = getMenuElement();
      expect(listbox).toBeInTheDocument();

      await user.keyboard('{ArrowDown}');
      expect(listbox).toBeInTheDocument();
      await user.keyboard('{Tab}');
      expect(listbox).not.toBeInTheDocument();
    });

    it('navigates options with up and down arrows', async () => {
      const user = userEvent.setup();
      render(<MultiSelectInput {...defaultProps} />);

      await user.tab();

      await user.keyboard('{ArrowDown}');

      // Check if dropdown menu is opened
      const listbox = getMenuElement();
      expect(listbox).toBeInTheDocument();
      let option1 = getOptionFromDropdown('Option 1');
      let option2 = getOptionFromDropdown('Option 2');
      expect(option1).toHaveAttribute(
        'class',
        expect.stringContaining('focused')
      );
      expect(option2).not.toHaveAttribute(
        'class',
        expect.stringContaining('focused')
      );

      await user.keyboard('{ArrowDown}');

      expect(option1).not.toHaveAttribute(
        'class',
        expect.stringContaining('focused')
      );
      expect(option2).toHaveAttribute(
        'class',
        expect.stringContaining('focused')
      );

      await user.keyboard('{ArrowUp}');

      expect(option1).toHaveAttribute(
        'class',
        expect.stringContaining('focused')
      );
      expect(option2).not.toHaveAttribute(
        'class',
        expect.stringContaining('focused')
      );
    });

    it('focuses the input when tabbing in', async () => {
      const user = userEvent.setup();
      render(<MultiSelectInput {...defaultProps} />);

      await user.tab();
      expect(getInputElement()).toHaveFocus();
    });
  });

  describe('Search', () => {
    it('filters options based on search text', async () => {
      const user = userEvent.setup();
      render(<MultiSelectInput {...defaultProps} />);

      const input = getInputElement();
      await user.click(input);
      await user.type(input, 'First');

      // Check if only matching option is displayed
      const listbox = getMenuElement();
      const options = within(listbox).getAllByRole('option');
      expect(options).toHaveLength(1);

      expect(within(listbox).getByText('Option 1')).toBeInTheDocument();
      expect(within(listbox).queryByText('Option 2')).not.toBeInTheDocument();
      expect(within(listbox).queryByText('Option 3')).not.toBeInTheDocument();
    });

    it('displays empty state message when no options match search', async () => {
      const user = userEvent.setup();
      render(
        <MultiSelectInput
          {...defaultProps}
          emptyStateMessage="Custom empty message"
        />
      );

      const input = getInputElement();
      await user.click(input);
      await user.type(input, 'nonexistent option');

      // Check if empty state message is displayed
      expect(screen.getByText('Custom empty message')).toBeInTheDocument();
    });
  });
});
