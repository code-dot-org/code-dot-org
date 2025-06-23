import {render} from '@testing-library/react';
import {act} from 'react-dom/test-utils';

import YourSchoolFormSection from '../formSection';
import YourSchoolMapSection from '../mapSection';
import YourSchool from '../YourSchool';

jest.mock('../mapSection');
jest.mock('../formSection');

const MockedMapSection = YourSchoolMapSection as jest.MockedFunction<
  typeof YourSchoolMapSection
>;
const MockedFormSection = YourSchoolFormSection as jest.MockedFunction<
  typeof YourSchoolFormSection
>;

MockedMapSection.mockImplementation(() => <div data-testid="map-section" />);
MockedFormSection.mockImplementation(() => <div data-testid="form-section" />);

describe('YourSchool', () => {
  const defaultProps = {
    dataSourceURL: 'https://example.com/data.json',
    regionalPartnerURL: 'https://example.com/regional-partner',
    privacyPolicyURL: 'https://example.com/privacy-policy',
  };

  const renderComponent = (props = {}) =>
    render(<YourSchool {...defaultProps} {...props} />);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct structure and initial state', () => {
    renderComponent();

    expect(MockedMapSection).toHaveBeenCalledTimes(1);
    expect(MockedMapSection).toHaveBeenCalledWith(
      expect.objectContaining({
        dataSourceURL: defaultProps.dataSourceURL,
        onTakeSurveyClick: expect.any(Function),
      }),
      expect.anything(),
    );

    expect(MockedFormSection).toHaveBeenCalledTimes(1);
    expect(MockedFormSection).toHaveBeenCalledWith(
      expect.objectContaining({
        regionalPartnerURL: defaultProps.regionalPartnerURL,
        privacyPolicyURL: defaultProps.privacyPolicyURL,
      }),
      expect.anything(),
    );
  });

  it('updates school state when onTakeSurveyClick is called', () => {
    const school = {nces_id: '123', name: 'Test School'};
    renderComponent();

    const initialCallCount = MockedFormSection.mock.calls.length;

    act(() => {
      const onTakeSurveyClick =
        MockedMapSection.mock.calls[0][0].onTakeSurveyClick;
      onTakeSurveyClick(school);
    });

    expect(MockedFormSection).toHaveBeenCalledTimes(initialCallCount + 1);
    expect(MockedFormSection).toHaveBeenLastCalledWith(
      expect.objectContaining({school}),
      expect.anything(),
    );
  });
});
