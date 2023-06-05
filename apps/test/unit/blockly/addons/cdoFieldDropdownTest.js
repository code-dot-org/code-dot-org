import {__TestInterface} from '@cdo/apps/blockly/addons/cdoFieldDropdown';
import {expect} from '../../../util/reconfiguredChai';

describe('Testing CdoFieldDropdown function - getUpdateOptionsFromConfig', () => {
  const getUpdatedOptionsFromConfig =
    __TestInterface.getUpdatedOptionsFromConfig;
  describe('test config string with printer-style number range', () => {
    it('only a number range', () => {
      const config = '6-8';
      const options = getUpdatedOptionsFromConfig(config);
      expect(options).to.deep.equal([
        ['6', '6'],
        ['7', '7'],
        ['8', '8'],
      ]);
    });
    it('only numbers separated by commas', () => {
      const config = '2, 5, 11';
      const options = getUpdatedOptionsFromConfig(config);
      expect(options).to.deep.equal([
        ['2', '2'],
        ['5', '5'],
        ['11', '11'],
      ]);
    });
    it('number range and numbers separated by commas', () => {
      const config = '2, 4, 16-18';
      const options = getUpdatedOptionsFromConfig(config);
      expect(options).to.deep.equal([
        ['2', '2'],
        ['4', '4'],
        ['16', '16'],
        ['17', '17'],
        ['18', '18'],
      ]);
    });
  });
  describe('test config string', () => {
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
});
