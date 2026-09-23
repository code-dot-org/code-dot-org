import CdoTheme from '../code.org';
import CodeaiTheme from '../codeai';
import CodeaiAuditTheme from '../codeai-audit';
import {
  DEFAULT_BRAND,
  getMuiThemeForBrand,
  resolveBrand,
} from '../getMuiThemeForBrand';

describe('getMuiThemeForBrand', () => {
  it('returns CodeaiTheme for codeai-next', () => {
    expect(getMuiThemeForBrand('codeai-next')).toBe(CodeaiTheme);
  });

  it('returns CodeaiAuditTheme for codeai-audit', () => {
    expect(getMuiThemeForBrand('codeai-audit')).toBe(CodeaiAuditTheme);
  });

  it.each(['code', 'codeai'])('returns CdoTheme for %s', brand => {
    expect(getMuiThemeForBrand(brand)).toBe(CdoTheme);
  });

  // apps/src/util/brand.ts resolves the same way; brandTest.ts asserts it there.
  it.each(['unknown-brand', undefined])(
    'falls back to the default brand for %s',
    brand => {
      expect(getMuiThemeForBrand(brand)).toBe(CodeaiTheme);
    },
  );

  it('names the brand it falls back to', () => {
    expect(getMuiThemeForBrand(DEFAULT_BRAND)).toBe(
      getMuiThemeForBrand(undefined),
    );
  });
});

describe('resolveBrand', () => {
  it.each(['code', 'codeai', 'codeai-next', 'codeai-audit'])(
    'passes %s through',
    brand => {
      expect(resolveBrand(brand)).toBe(brand);
    },
  );

  it.each(['foo', '', null, undefined])(
    'replaces %s with the default',
    brand => {
      expect(resolveBrand(brand)).toBe(DEFAULT_BRAND);
    },
  );

  // The CSS tokens match the attribute exactly, so a value this returns must
  // always be one the theme lookup agrees with.
  it.each(['foo', '', 'codeai-next', 'code'])(
    'agrees with getMuiThemeForBrand for %s',
    brand => {
      expect(getMuiThemeForBrand(brand)).toBe(
        getMuiThemeForBrand(resolveBrand(brand)),
      );
    },
  );
});
