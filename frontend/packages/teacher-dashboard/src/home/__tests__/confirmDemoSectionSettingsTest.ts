import confirmDemoSectionSettings from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/confirmDemoSectionSettings';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  get: jest.fn(),
}));

const mockGet = HttpClient.get as jest.MockedFunction<typeof HttpClient.get>;

// The endpoint replies 204 (up to date) with no body, so a real Response is
// unnecessary; casting a status-only stub avoids the 204-with-body quirk.
const noContent = {status: 204} as Response;

const okWith = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: {'Content-Type': 'application/json'},
  });

describe('confirmDemoSectionSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves false without a request when there is no demo section', async () => {
    expect(await confirmDemoSectionSettings(null)).toBe(false);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('queries the demo staleness endpoint with the section id', async () => {
    mockGet.mockResolvedValue(noContent);

    await confirmDemoSectionSettings(42);

    expect(mockGet).toHaveBeenCalledWith(
      '/api/v1/sections/demo/check_staleness?id=42',
    );
  });

  it('treats a 204 as up to date', async () => {
    mockGet.mockResolvedValue(noContent);
    expect(await confirmDemoSectionSettings(1)).toBe(false);
  });

  it('treats a 200 carrying a message as stale', async () => {
    mockGet.mockResolvedValue(okWith({message: 'out of date'}));
    expect(await confirmDemoSectionSettings(1)).toBe(true);
  });

  it('treats a 200 without a message as up to date', async () => {
    mockGet.mockResolvedValue(okWith({}));
    expect(await confirmDemoSectionSettings(1)).toBe(false);
  });

  it('resolves false and logs when the request fails', async () => {
    mockGet.mockRejectedValue(new Error('boom'));
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(await confirmDemoSectionSettings(1)).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
