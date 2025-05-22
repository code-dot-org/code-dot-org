import {render, screen, fireEvent} from '@testing-library/react';

import {getStudioUrl} from '@/config/studio';

import SchoolSearchFieldset from '../SchoolSearchFieldset';

describe('SchoolSearchFieldset', () => {
  const mockOnSelect = jest.fn();
  const mockSchools = [
    {nces_id: '12345', name: 'Test School A'},
    {nces_id: '54321', name: 'Test School B'},
  ];

  const renderComponent = () =>
    render(<SchoolSearchFieldset onSelect={mockOnSelect} />);

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(global, 'fetch').mockImplementation(url => {
      if (
        String(url).startsWith(
          getStudioUrl('/dashboardapi/v1/schoolzipsearch/'),
        )
      ) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSchools,
        } as unknown as Response);
      }

      return Promise.reject(new Error(`Unexpected fetch to ${url}`));
    });
  });

  it('renders input fields and dropdown', () => {
    renderComponent();
    expect(
      screen.getByLabelText(/Enter your school's zip code/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Select your school from the list/i),
    ).toBeInTheDocument();
  });

  it('fetches and displays school options when a valid zip code is entered', async () => {
    renderComponent();

    const zipInput = screen.getByLabelText(/Enter your school's zip code/i);
    fireEvent.change(zipInput, {target: {value: '90210'}});

    expect(await screen.findByText('Test School A')).toBeInTheDocument();
    expect(await screen.findByText('Test School B')).toBeInTheDocument();
  });

  it('calls onSelect when a school is selected', async () => {
    renderComponent();

    const zipInput = screen.getByLabelText(/Enter your school's zip code/i);
    fireEvent.change(zipInput, {target: {value: '90210'}});
    expect(await screen.findByText('Test School A')).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText(/Select your school from the list/i),
      {
        target: {value: '12345'},
      },
    );
    expect(mockOnSelect).toHaveBeenCalledWith('12345', 'Test School A');
  });

  it('shows an error message if fetch fails', async () => {
    const error = 'API is down';

    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(error),
    );

    renderComponent();

    const zipInput = screen.getByLabelText(/Enter your school's zip code/i);
    fireEvent.change(zipInput, {target: {value: '90210'}});

    expect(await screen.findByText(error)).toBeInTheDocument();
  });

  it('resets school options if an invalid zip is entered', async () => {
    renderComponent();

    const zipInput = screen.getByLabelText(/Enter your school's zip code/i);
    fireEvent.change(zipInput, {target: {value: '00000'}});

    expect(
      await screen.findByLabelText(/Select your school from the list/i),
    ).toBeDisabled();
  });
});
