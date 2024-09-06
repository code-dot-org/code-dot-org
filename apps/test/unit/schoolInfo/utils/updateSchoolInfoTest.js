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
  const formUrl = 'https://example.com/update';
  const authTokenName = 'auth_token';
  const authTokenValue = 'token123';
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

    mockBuildSchoolData.mockReturnValue(mockSchoolData);
    mockGetAuthenticityToken.mockResolvedValue('authenticity-token');

    fetch.mockResolvedValueOnce({
      ok: true,
    });

    await updateSchoolInfo({
      formUrl,
      authTokenName,
      authTokenValue,
      schoolId,
      country,
      schoolName,
      schoolZip,
    });

    expect(fetch).toHaveBeenCalledWith(formUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'authenticity-token',
      },
      body: JSON.stringify({
        _method: 'patch',
        [authTokenName]: authTokenValue,
        ...mockSchoolData,
      }),
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

    mockBuildSchoolData.mockReturnValue(mockSchoolData);
    mockGetAuthenticityToken.mockResolvedValue('authenticity-token');

    fetch.mockResolvedValueOnce({
      ok: false,
    });

    await expect(
      updateSchoolInfo({
        formUrl,
        authTokenName,
        authTokenValue,
        schoolId,
        country,
        schoolName,
        schoolZip,
      })
    ).rejects.toThrow('School info update failed');
  });

  it('should handle cases where buildSchoolData returns undefined', async () => {
    mockBuildSchoolData.mockReturnValue(undefined);

    await updateSchoolInfo({
      formUrl,
      authTokenName,
      authTokenValue,
      schoolId,
      country,
      schoolName,
      schoolZip,
    });

    expect(fetch).not.toHaveBeenCalled();
  });
});
