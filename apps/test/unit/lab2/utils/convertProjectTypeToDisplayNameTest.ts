import {convertProjectTypeToDisplayName} from '@cdo/apps/lab2/utils/convertProjectTypeToDisplayName';

describe('convertProjectTypeToDisplayName', () => {
  it('names a Quest Builder project', () => {
    expect(convertProjectTypeToDisplayName('quest_builder')).toBe(
      'Quest Builder'
    );
  });

  it('gives no name for a type that has none', () => {
    expect(
      convertProjectTypeToDisplayName(
        'not_a_type' as Parameters<typeof convertProjectTypeToDisplayName>[0]
      )
    ).toBe('');
  });
});
