import {render, screen, waitFor, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import {AutocompleteInput} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshop_form/components/AutocompleteInput';

const mockRef = React.createRef();
jest.mock('@cdo/apps/util/hooks/useOutsideClick', () => ({
  __esModule: true,
  default: jest.fn(() => mockRef),
}));

// AutocompleteInput does not manage its own state
const ComponentWithState = (props = {}) => {
  const [state, setState] = useState(props.value ?? '');
  const handleChange = event => {
    setState(event.target.value);
    props.onChange(event);
  };
  return <AutocompleteInput {...props} value={state} onChange={handleChange} />;
};

ComponentWithState.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

describe('AutocompleteInput Component', () => {
  let mockOnChange;
  let mockFetchOptions;
  let user;
  const defaultProps = {
    id: 'mock-id',
    label: 'Location Address',
    name: 'locationAddress',
    size: 's',
    className: 'test-class',
    onChange: jest.fn(),
    value: '',
    errorMessage: undefined,
    fetchOptions: jest.fn(),
    // not mocking useDebounce or using fake timers because userEvent uses timers
    // to simulate keyboard interaction. instead reducing debounce delay to speed
    // up tests
    debounceDelay: 100,
  };

  const renderComponent = (props = {}) =>
    render(<ComponentWithState {...defaultProps} {...props} />);

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
    mockOnChange = jest.fn();
    mockFetchOptions = jest.fn();
    defaultProps.onChange = mockOnChange;
    defaultProps.fetchOptions = mockFetchOptions;
    mockFetchOptions.mockResolvedValue([]);
  });

  it('renders the TextField with correct initial props', () => {
    renderComponent({value: 'Initial Value'});
    const input = screen.getByLabelText('Location Address');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Initial Value');
    expect(input).toHaveAttribute('name', 'locationAddress');
    expect(input).toHaveAttribute('placeholder', 'Type to see results');
    expect(input).toHaveAttribute('role', 'combobox');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).toHaveAttribute('aria-controls', 'mock-id');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument(); // No options initially
  });

  it('calls onChange prop when typing in the input', async () => {
    renderComponent();
    const input = screen.getByLabelText('Location Address');
    const newValue = 'New York';
    await act(async () => {
      await userEvent.type(input, newValue);
    });
    expect(mockOnChange).toHaveBeenCalledTimes(newValue.length);
  });

  it('calls fetchOptions after debounce', async () => {
    mockFetchOptions.mockResolvedValue({
      options: ['123 Main St'],
    });

    renderComponent({value: '123'}); // Initial render doesn't trigger suggest

    expect(mockFetchOptions).not.toHaveBeenCalled();

    const input = screen.getByLabelText('Location Address');
    await act(async () => {
      await userEvent.type(input, ' Main');
    });

    // Wait for the debounced effect and API call
    await waitFor(() => {
      expect(mockFetchOptions).toHaveBeenCalledTimes(1);
      expect(mockFetchOptions).toHaveBeenCalledWith('123 Main');
    });
  });

  it('displays options when API returns results', async () => {
    const options = [
      '123 Main St, Chicago, IL',
      '123 South Parkway, Denver, CO',
    ];
    mockFetchOptions.mockResolvedValue(options);

    renderComponent();

    const input = screen.getByLabelText('Location Address');
    await act(async () => {
      await userEvent.type(input, '123');
    });

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    const listItems = screen.getAllByRole('option');
    expect(listItems).toHaveLength(2);
    expect(listItems[0]).toHaveTextContent('123 Main St, Chicago, IL');
    expect(listItems[1]).toHaveTextContent('123 South Parkway, Denver, CO');
    expect(screen.getByLabelText('Location Address')).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('does not make an api call when an option is selected', async () => {
    const options = ['123 Main St'];
    mockFetchOptions.mockResolvedValue(options);

    renderComponent();

    const input = screen.getByLabelText('Location Address');
    await act(async () => {
      await userEvent.type(input, '123 Main St');
    });

    await waitFor(() => {
      expect(mockFetchOptions).toHaveBeenCalledTimes(1);
      expect(mockFetchOptions).toHaveBeenCalledWith('123 Main St');
    });

    const option = screen.getByText('123 Main St');
    await user.click(option);

    await waitFor(() => {
      expect(mockFetchOptions).toHaveBeenCalledTimes(1);
    });
  });

  it('selecting an option on click, calls onChange, and hides list', async () => {
    const options = ['123 Main St'];
    mockFetchOptions.mockResolvedValue(options);

    renderComponent();
    const value = '123';

    const input = screen.getByLabelText('Location Address');
    await act(async () => {
      await userEvent.type(input, value);
    });

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    const option = screen.getByText('123 Main St');
    await user.click(option);

    expect(mockOnChange).toHaveBeenCalledTimes(value.length + 1);
    expect(mockOnChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'locationAddress',
          value: '123 Main St',
        }),
      })
    );

    // List should be hidden after selection
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Location Address')).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.getByLabelText('Location Address')).toHaveFocus();
  });

  describe('Keyboard Navigation', () => {
    let input;
    const value = 'Address';
    const options = ['First Address', 'Second Address', 'Third Address'];

    beforeEach(async () => {
      mockFetchOptions.mockResolvedValue(options);
      renderComponent();
      input = screen.getByLabelText('Location Address');
      await act(async () => {
        await userEvent.type(input, value);
      });
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('navigates options with ArrowDown and ArrowUp', async () => {
      await user.type(input, '{arrowdown}'); // Focus first item
      expect(input).toHaveAttribute('aria-activedescendant', 'mock-id-item-0');
      expect(screen.getByText('First Address')).toHaveAttribute(
        'class',
        expect.stringContaining('active')
      );

      await user.type(input, '{arrowdown}'); // Focus second item
      expect(input).toHaveAttribute('aria-activedescendant', 'mock-id-item-1');
      expect(screen.getByText('Second Address')).toHaveAttribute(
        'class',
        expect.stringContaining('active')
      );
      expect(screen.getByText('First Address')).not.toHaveAttribute(
        'class',
        expect.stringContaining('active')
      );

      await user.type(input, '{arrowup}'); // Focus first item again
      expect(input).toHaveAttribute('aria-activedescendant', 'mock-id-item-0');
      expect(screen.getByText('First Address')).toHaveAttribute(
        'class',
        expect.stringContaining('active')
      );
      expect(screen.getByText('Second Address')).not.toHaveAttribute(
        'class',
        expect.stringContaining('active')
      );

      await user.type(input, '{arrowup}'); // Stays on first item
      expect(input).toHaveAttribute('aria-activedescendant', 'mock-id-item-0');
    });

    it('selects option with Enter key', async () => {
      await user.type(input, '{arrowdown}'); // Select first
      await user.type(input, '{enter}');

      expect(mockOnChange).toHaveBeenCalledTimes(value.length + 1);
      expect(mockOnChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({value: 'First Address'}),
        })
      );
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('selects option with Space key', async () => {
      await user.type(input, '{arrowdown}'); // Select first
      await user.type(input, '{arrowdown}'); // Select second
      await user.type(input, ' '); // Select with space

      expect(mockOnChange).toHaveBeenCalledTimes(value.length + 1);
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({value: 'Second Address'}),
        })
      );
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('closes menu with Escape key', async () => {
      await user.type(input, '{escape}');

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    it('closes menu with Tab key', async () => {
      await user.type(input, '{tab}');

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
