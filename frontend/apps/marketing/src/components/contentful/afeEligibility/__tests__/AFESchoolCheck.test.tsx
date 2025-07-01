import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AFESchoolCheck from '../AFESchoolCheck';

const mockSchoolId = '1234';
const mockSchoolName = 'Test School';
jest.mock(
  '@/components/contentful/schoolSearchFieldset',
  () =>
    (props: {onSelect: (school: {name: string; nces_id: string}) => void}) => (
      <label>
        Select School
        <select
          onChange={e =>
            props.onSelect({
              name: e.target.options[e.target.selectedIndex].text,
              nces_id: e.target.value,
            })
          }
        >
          <option value="">Select</option>
          <option value={mockSchoolId}>{mockSchoolName}</option>
        </select>
      </label>
    ),
);

jest.mock('@statsig/react-bindings', () => ({
  useStatsigClient: () => ({
    logEvent: jest.fn(),
  }),
}));

describe('AFESchoolCheck', () => {
  const mockEmail = 'teacher@example.com';

  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (email: string = mockEmail) =>
    render(<AFESchoolCheck email={email} onComplete={mockOnComplete} />);

  const selectSchool = async (schoolId = mockSchoolId) =>
    userEvent.selectOptions(screen.getByLabelText('Select School'), schoolId);

  const submitForm = async () =>
    userEvent.click(
      screen.getByRole('button', {name: "Find out if I'm eligible"}),
    );

  it('renders the form and initial elements', async () => {
    renderComponent();

    expect(
      await screen.findByRole('heading', {name: 'Am I eligible?'}),
    ).toBeInTheDocument();
    expect(await screen.findByLabelText('Email')).toHaveValue(mockEmail);
    expect(await screen.findByLabelText('Select School')).toBeInTheDocument();
    expect(
      await screen.findByRole('button', {name: /find out if i'm eligible/i}),
    ).toBeInTheDocument();
  });

  it('prevents submission when form is invalid', async () => {
    renderComponent();

    await submitForm();

    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('submits the form and handles eligible response', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(url => {
      if (
        String(url).includes(
          `/dashboardapi/v1/schools/${mockSchoolId}/afe_high_needs`,
        )
      ) {
        return Promise.resolve({
          ok: true,
          json: async () => ({afe_high_needs: true}),
        } as unknown as Response);
      }
      return Promise.reject(new Error('Unexpected fetch call'));
    });

    renderComponent();

    await selectSchool();
    await submitForm();

    expect(mockOnComplete).toHaveBeenCalledWith({
      isEligible: true,
      email: mockEmail,
      schoolId: mockSchoolId,
      schoolName: mockSchoolName,
    });
  });

  it('handles ineligible response and shows dialog', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(url => {
      if (
        String(url).includes(
          `/dashboardapi/v1/schools/${mockSchoolId}/afe_high_needs`,
        )
      ) {
        return Promise.resolve({
          ok: true,
          json: async () => ({afe_high_needs: false}),
        } as unknown as Response);
      }
      return Promise.reject(new Error('Unexpected fetch call'));
    });

    renderComponent();

    await selectSchool();
    await submitForm();

    expect(
      await screen.findByText(/we've checked your eligibility/i),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', {name: /close/i}));

    expect(mockOnComplete).toHaveBeenCalledWith({
      isEligible: false,
      email: mockEmail,
      schoolId: mockSchoolId,
      schoolName: mockSchoolName,
    });
  });

  it('handles fetch error and displays an error message', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(url => {
      if (
        String(url).includes(
          `/dashboardapi/v1/schools/${mockSchoolId}/afe_high_needs`,
        )
      ) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.reject(new Error('Unexpected fetch call'));
    });

    renderComponent();

    await selectSchool();
    await submitForm();

    expect(
      await screen.findByText(/something went wrong/i),
    ).toBeInTheDocument();
  });
});
