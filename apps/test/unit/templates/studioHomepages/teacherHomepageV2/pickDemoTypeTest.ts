import {pickDemoType} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/pickDemoType';

describe('pickDemoType', () => {
  it('prefers high school grades', () => {
    expect(pickDemoType(['5', '8', '10'])).toBe('high');
  });

  it('falls back to middle school grades when no high school grades exist', () => {
    expect(pickDemoType(['6', '8'])).toBe('middle');
  });

  it('returns elementary for elementary-only grades', () => {
    expect(pickDemoType(['K', '3'])).toBe('elementary');
  });

  it('defaults to high for empty or missing grade data', () => {
    expect(pickDemoType([])).toBe('high');
    expect(pickDemoType(undefined)).toBe('high');
    expect(pickDemoType(null)).toBe('high');
  });
});
