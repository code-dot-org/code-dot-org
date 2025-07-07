import {getCookieNameByStage} from '../getCookie';

describe('getCookieNameByStage', () => {
  it('returns the cookie name unchanged for production stage', () => {
    expect(getCookieNameByStage('session', 'production')).toBe('session');
    expect(getCookieNameByStage('user_id', 'production')).toBe('user_id');
  });

  it('appends the stage to the cookie name for non-production stages', () => {
    expect(getCookieNameByStage('session', 'test')).toBe('session_test');
    expect(getCookieNameByStage('user_id', 'development')).toBe(
      'user_id_development',
    );
    expect(getCookieNameByStage('auth', 'test')).toBe('auth_test');
  });
});
