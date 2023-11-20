import {
  getUpdatedOptionsFromConfig,
  arrayToMap,
} from '@cdo/apps/blockly/addons/cdoFieldDropdown';
import {expect} from '../../../util/reconfiguredChai';

describe('Testing function getUpdateOptionsFromConfig', () => {
  describe('Test config string with printer-style number range', () => {
    it('Config only has a number range', () => {
      const config = '6-8';
      const options = getUpdatedOptionsFromConfig(config, {});

      expect(options).to.deep.equal([
        ['6', '6'],
        ['7', '7'],
        ['8', '8'],
      ]);
    });

    it('Config has only numbers separated by commas', () => {
      const config = '2, 5, 11';
      const options = getUpdatedOptionsFromConfig(config, {});

      expect(options).to.deep.equal([
        ['2', '2'],
        ['5', '5'],
        ['11', '11'],
      ]);
    });

    it('Config has number range and numbers separated by commas', () => {
      const config = '2, 4, 16-18';
      const options = getUpdatedOptionsFromConfig(config, {});

      expect(options).to.deep.equal([
        ['2', '2'],
        ['4', '4'],
        ['16', '16'],
        ['17', '17'],
        ['18', '18'],
      ]);
    });
  });

  describe('Test config string that does not contain numbers', () => {
    it('Config has with fewer options than menuGenerator', () => {
      const config = "'CAT', 'SLOTH'";
      const menuGenerator = [
        ['cat', "'CAT'"],
        ['sloth', "'SLOTH'"],
        ['alien', "'ALIEN'"],
        ['bear', "'BEAR'"],
      ];
      const existingOptionsMap = arrayToMap(menuGenerator);
      const options = getUpdatedOptionsFromConfig(config, existingOptionsMap);

      expect(options).to.deep.equal([
        ['cat', "'CAT'"],
        ['sloth', "'SLOTH'"],
      ]);
    });

    it('Config has an option not included in menuGenerator', () => {
      const config = "'CAT', 'SLOTH', 'GIRAFFE'";
      const menuGenerator = [
        ['cat', "'CAT'"],
        ['sloth', "'SLOTH'"],
        ['alien', "'ALIEN'"],
        ['bear', "'BEAR'"],
      ];
      const existingOptionsMap = arrayToMap(menuGenerator);
      const options = getUpdatedOptionsFromConfig(config, existingOptionsMap);

      expect(options).to.deep.equal([
        ['cat', "'CAT'"],
        ['sloth', "'SLOTH'"],
        ['giraffe', "'GIRAFFE'"],
      ]);
    });

    it('Config has an option for which human-readable string is different from language-neutral string', () => {
      const config = "'scale', 'rotation'";
      const menuGenerator = [
        ['size', "'scale'"],
        ['rotation', "'rotation'"],
        ['direction', "'direction'"],
      ];
      const existingOptionsMap = arrayToMap(menuGenerator);
      const options = getUpdatedOptionsFromConfig(config, existingOptionsMap);
      expect(options).to.deep.equal([
        ['size', "'scale'"],
        ['rotation', "'rotation'"],
      ]);
    });
  });
});
