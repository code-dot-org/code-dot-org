import {buildSchoolData} from '@cdo/apps/schoolInfo/utils/buildSchoolData';
import {updateSchoolInfo} from '@cdo/apps/schoolInfo/utils/updateSchoolInfo';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';

// Mock dependencies
jest.mock('@cdo/apps/schoolInfo/utils/buildSchoolData', () => ({
  buildSchoolData: jest.fn(),
}));

jest.mock('@cdo/apps/util/AuthenticityTokenStore', () => ({
  getAuthenticityToken: jest.fn(),
}));

window.fetch = jest.fn();

describe('updateSchoolInfo', () => {
  const mockBuildSchoolData = buildSchoolData;
  const mockGetAuthenticityToken = getAuthenticityToken;
  const schoolId = '1';
  const country = 'US';
  const schoolName = 'Test School';
  const schoolZip = '12345';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call fetch with the correct arguments and handle successful update', async () => {
    const mockSchoolData = {
      user: {
        school_info_attributes: {
          school_id: schoolId,
        },
      },
    };

    mockBuildSchoolData.mockReturnValueOnce(mockSchoolData);
    mockGetAuthenticityToken.mockResolvedValueOnce('authenticity-token');

    fetch.mockResolvedValueOnce({
      ok: true,
    });

    await updateSchoolInfo({
      schoolId,
      country,
      schoolName,
      schoolZip,
    });

    expect(fetch).toHaveBeenCalledWith('/api/v1/user_school_infos', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'authenticity-token',
      },
      body: JSON.stringify(mockSchoolData),
    });
  });

  it('should throw an error when the fetch response is not OK', async () => {
    const mockSchoolData = {
      user: {
        school_info_attributes: {
          school_id: schoolId,
        },
      },
    };

    mockBuildSchoolData.mockReturnValueOnce(mockSchoolData);
    mockGetAuthenticityToken.mockResolvedValueOnce('authenticity-token');

    fetch.mockResolvedValueOnce({
      ok: false,
    });

    await expect(
      updateSchoolInfo({
        schoolId,
        country,
        schoolName,
        schoolZip,
      })
    ).rejects.toThrow('School info update failed');
  });

  it('should handle cases where buildSchoolData returns undefined', async () => {
    mockBuildSchoolData.mockReturnValueOnce(undefined);

    await updateSchoolInfo({
      schoolId,
      country,
      schoolName,
      schoolZip,
    });

    expect(fetch).not.toHaveBeenCalled();
  });
});
