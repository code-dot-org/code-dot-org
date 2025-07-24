import {render, screen, fireEvent} from '@testing-library/react';

import {getStudioUrl} from '@/config/studio';

import SchoolSearchFieldset, {
  SchoolSearchFieldsetProps,
} from '../SchoolSearchFieldset';

describe('SchoolSearchFieldset', () => {
  const mockOnSelect = jest.fn();
  const schoolZip = '90210';
  const mockSchools = [
    {nces_id: '12345', name: 'Test School A', zip: schoolZip},
    {nces_id: '54321', name: 'Test School B', zip: schoolZip},
  ];

  const renderComponent = (props: Partial<SchoolSearchFieldsetProps> = {}) =>
    render(<SchoolSearchFieldset {...props} onSelect={mockOnSelect} />);

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(global, 'fetch').mockImplementation(url => {
      if (
        String(url).startsWith(
          getStudioUrl(`/dashboardapi/v1/schoolzipsearch/${schoolZip}`),
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

  it('renders provided school as text field when no zip code is entered', () => {
    const school = {nces_id: '67890', name: 'Test School C'};

    renderComponent({school});

    const schoolNameField: HTMLInputElement =
      screen.getByLabelText(/School name/i);
    expect(schoolNameField).toBeInTheDocument();
    expect(schoolNameField.value).toBe(school.name);
  });

  it('fetches and displays school options when a valid zip code is entered', async () => {
    renderComponent();

    const zipInput = screen.getByLabelText(/Enter your school's zip code/i);
    fireEvent.change(zipInput, {target: {value: schoolZip}});

    const selectedSchoolOption: HTMLOptionElement = await screen.findByRole(
      'option',
      {name: /Other school not listed below/i},
    );
    expect(selectedSchoolOption.selected).toBe(true);

    expect(
      await screen.findByRole('option', {name: mockSchools[0].name}),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('option', {name: mockSchools[1].name}),
    ).toBeInTheDocument();
  });

  it('fetches and selects provided school when it has a valid zip code', async () => {
    const school = mockSchools[1];

    renderComponent({school});

    const selectedSchoolOption: HTMLOptionElement = await screen.findByRole(
      'option',
      {name: school.name},
    );
    expect(selectedSchoolOption.selected).toBe(true);

    expect(
      await screen.findByRole('option', {name: mockSchools[0].name}),
    ).toBeInTheDocument();
  });

  it('calls onSelect when a school is selected', async () => {
    const school = mockSchools[0];

    renderComponent();

    const zipInput = screen.getByLabelText(/Enter your school's zip code/i);
    fireEvent.change(zipInput, {target: {value: schoolZip}});
    expect(await screen.findByText(school.name)).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText(/Select your school from the list/i),
      {
        target: {value: school.nces_id},
      },
    );
    expect(mockOnSelect).toHaveBeenCalledWith(school);
  });

  it('shows an error message if fetch fails', async () => {
    const error = 'API is down';

    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(error),
    );

    renderComponent();

    const zipInput = screen.getByLabelText(/Enter your school's zip code/i);
    fireEvent.change(zipInput, {target: {value: schoolZip}});

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
