import CodeaiTheme from '../codeai';
import CodeaiAuditTheme from '../codeai-audit';
import {getMuiThemeForBrand} from '../getMuiThemeForBrand';

describe('getMuiThemeForBrand', () => {
  it('returns CodeaiTheme for codeai-next', () => {
    expect(getMuiThemeForBrand('codeai-next')).toBe(CodeaiTheme);
  });

  it('returns CodeaiAuditTheme for codeai-audit', () => {
    expect(getMuiThemeForBrand('codeai-audit')).toBe(CodeaiAuditTheme);
  });

  it.each(['unknown-brand', undefined])('returns CodeaiTheme for %s', brand => {
    expect(getMuiThemeForBrand(brand)).toBe(CodeaiTheme);
  });
});
