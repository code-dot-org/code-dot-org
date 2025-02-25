import {
  getSessionDate,
  getSessionTimes,
} from '@cdo/apps/code-studio/pd/sessionDateUtils';
import {
  DATE_FORMAT,
  TIME_FORMAT,
} from '@cdo/apps/code-studio/pd/workshop_dashboard/workshopConstants';

describe('getSessionDate', () => {
  let mockTimeZoneResolvedOptions;

  beforeEach(() => {
    mockTimeZoneResolvedOptions = jest
      .spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions')
      .mockReturnValue({
        timeZone: 'America/Denver',
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return the session date in the user's time zone", () => {
    const session = {
      start: '2025-02-10T16:00:00Z',
    };

    let result = getSessionDate({session, format: DATE_FORMAT, isLocal: false});

    expect(result).toBe('2025-02-10');

    mockTimeZoneResolvedOptions.mockReturnValueOnce({
      timeZone: 'Australia/Sydney',
    });

    result = getSessionDate({session, format: DATE_FORMAT, isLocal: false});

    expect(result).toBe('2025-02-11');
  });

  it('should return the legacy session date without offset timezone', () => {
    const session = {
      start: '2025-02-11T09:00:00Z',
    };

    let result = getSessionDate({
      session,
      format: DATE_FORMAT,
      isLocal: true,
    });

    expect(result).toBe('2025-02-11');

    mockTimeZoneResolvedOptions.mockReturnValueOnce({
      timeZone: 'Australia/Sydney',
    });

    result = getSessionDate({session, format: DATE_FORMAT, isLocal: false});

    expect(result).toBe('2025-02-11');
  });
});

describe('getSessionTimes', () => {
  let mockTimeZoneResolvedOptions;

  beforeEach(() => {
    mockTimeZoneResolvedOptions = jest
      .spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions')
      .mockReturnValue({
        timeZone: 'America/Denver',
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return start and end times in user time zone', () => {
    const session = {
      start: '2025-02-11T16:00:00Z',
      end: '2025-02-12T00:00:00Z',
    };

    let result = getSessionTimes({
      session,
      format: TIME_FORMAT,
      isLocal: false,
    });

    expect(result.startTime).toBe('9:00am');
    expect(result.endTime).toBe('5:00pm');
    expect(result.tzAbbreviation).toBe('MST');

    mockTimeZoneResolvedOptions.mockReturnValueOnce({
      timeZone: 'Australia/Sydney',
    });

    result = getSessionTimes({
      session,
      format: TIME_FORMAT,
      isLocal: false,
    });

    expect(result.startTime).toBe('3:00am');
    expect(result.endTime).toBe('11:00am');
    expect(result.tzAbbreviation).toBe('AEDT');
  });

  it('should return start and end times without offset timezone if local', () => {
    const session = {
      start: '2025-02-11T09:00:00Z',
      end: '2025-02-11T17:00:00Z',
    };

    let result = getSessionTimes({
      session,
      format: TIME_FORMAT,
      isLocal: true,
    });

    expect(result.startTime).toBe('9:00am');
    expect(result.endTime).toBe('5:00pm');
    expect(result.tzAbbreviation).toBe('local');

    mockTimeZoneResolvedOptions.mockReturnValueOnce({
      timeZone: 'Australia/Sydney',
    });

    result = getSessionTimes({
      session,
      format: TIME_FORMAT,
      isLocal: true,
    });

    expect(result.startTime).toBe('9:00am');
    expect(result.endTime).toBe('5:00pm');
    expect(result.tzAbbreviation).toBe('local');
  });
});
