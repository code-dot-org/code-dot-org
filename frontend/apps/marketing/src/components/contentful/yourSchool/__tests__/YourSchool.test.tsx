import {render} from '@testing-library/react';

import YourSchoolMapSection from '../mapSection';
import YourSchool from '../YourSchool';

jest.mock('../mapSection', jest.fn);

describe('YourSchool', () => {
  const dataSourceURL = 'https://example.com/data.json';

  const renderComponent = (props = {}) =>
    render(<YourSchool {...{dataSourceURL}} {...props} />);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct structure and initial state', () => {
    renderComponent();

    expect(YourSchoolMapSection).toHaveBeenCalledTimes(1);
    expect(YourSchoolMapSection).toHaveBeenCalledWith(
      expect.objectContaining({
        dataSourceURL,
        onTakeSurveyClick: expect.any(Function),
      }),
      expect.anything(),
    );
  });
});
