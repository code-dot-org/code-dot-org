import {
  getResponsiveBreakpoint,
  ResponsiveSize,
} from '@cdo/apps/code-studio/responsiveRedux';

describe('responsiveRedux', () => {
  it('getResponsiveBreakpoint returns lg', () => {
    expect(getResponsiveBreakpoint(1000)).toBe(ResponsiveSize.lg);
  });
  it('getResponsiveBreakpoint returns md', () => {
    expect(getResponsiveBreakpoint(800)).toBe(ResponsiveSize.md);
  });
  it('getResponsiveBreakpoint returns sm', () => {
    expect(getResponsiveBreakpoint(700)).toBe(ResponsiveSize.sm);
  });
  it('getResponsiveBreakpoint returns xs', () => {
    expect(getResponsiveBreakpoint(500)).toBe(ResponsiveSize.xs);
  });
  it('getResponsiveBreakpoint returns xs if 0', () => {
    jest.spyOn(console, 'error').mockClear().mockImplementation();
    expect(getResponsiveBreakpoint(0)).toBe(ResponsiveSize.xs);
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
