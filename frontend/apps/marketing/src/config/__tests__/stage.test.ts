import {getStage} from '../stage';

describe('getStage', () => {
  beforeEach(() => {
    jest.resetModules();
    delete process.env.NEXT_PUBLIC_STAGE;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).window;
  });

  it('should return "development" when no environment variable or domain is set', () => {
    expect(getStage()).toBe('development');
  });

  it('should return the stage from the environment variable if set', () => {
    process.env.NEXT_PUBLIC_STAGE = 'production';
    expect(getStage()).toBe('production');
  });

  it('should return "test" for a test domain', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).window = {location: {host: 'test.code.org'}};
    expect(getStage()).toBe('test');
  });

  it('should return "production" for a production domain', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).window = {location: {host: 'code.org'}};
    expect(getStage()).toBe('production');
  });

  it('should return "test" for an unknown domain', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).window = {location: {host: 'unknown.domain'}};
    expect(getStage()).toBe('test');
  });

  it('should return undefined for an invalid environment variable', () => {
    process.env.NEXT_PUBLIC_STAGE = 'invalid-stage';
    expect(getStage()).toBe('development');
  });
});
