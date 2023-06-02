import {__TestInterface} from '@cdo/apps/blockly/addons/cdoFieldDropdown';
import {expect} from '../../../util/reconfiguredChai';

describe('Testing CdoFieldDropdown function - getUpdateOptionsFromConfig', () => {
  const getUpdatedOptionsFromConfig =
    __TestInterface.getUpdatedOptionsFromConfig;

  it('test config string with printer-style number range', () => {
    const config = '2, 6-8';
    const options = getUpdatedOptionsFromConfig(config);
    expect(options).to.deep.equal([
      ['2', '2'],
      ['6', '6'],
      ['7', '7'],
      ['8', '8'],
    ]);
  });

  it('test config string with printer-style number range', () => {
    const config = '2, 5, 9';
    const options = getUpdatedOptionsFromConfig(config);
    expect(options).to.deep.equal([
      ['2', '2'],
      ['5', '5'],
      ['9', '9'],
    ]);
  });

  it('test config string with fewer options than menuGenerator', () => {
    const config = "'CAT', 'SLOTH'";
    const menuGenerator = [
      ['cat', "'CAT'"],
      ['sloth', "'SLOTH'"],
      ['alien', "'ALIEN'"],
      ['bear', "'BEAR'"],
    ];
    const options = getUpdatedOptionsFromConfig(config, menuGenerator);
    expect(options).to.deep.equal([
      ['cat', "'CAT'"],
      ['sloth', "'SLOTH'"],
    ]);
  });

  it('test config string with option not included in menuGenerator', () => {
    const config = "'CAT', 'SLOTH', 'GIRAFFE'";
    const menuGenerator = [
      ['cat', "'CAT'"],
      ['sloth', "'SLOTH'"],
      ['alien', "'ALIEN'"],
      ['bear', "'BEAR'"],
    ];
    const options = getUpdatedOptionsFromConfig(config, menuGenerator);
    expect(options).to.deep.equal([
      ['cat', "'CAT'"],
      ['sloth', "'SLOTH'"],
      ['giraffe', "'GIRAFFE'"],
    ]);
  });
});
