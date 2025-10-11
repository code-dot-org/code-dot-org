// We have to include the locale files below as translations must be loaded in the global
// scope for HeadlessChrome to run properly.
import craftI18n from '@cdo/apps/craft/locale'; // eslint-disable-line no-unused-vars
import * as craftRedux from '@cdo/apps/craft/redux';
import * as utils from '@cdo/apps/craft/utils';
import commonI18n from '@cdo/locale'; // eslint-disable-line no-unused-vars

describe('craft utils', () => {
  describe('handlePlayerSelection', () => {
    const defaultPlayer = 'Alex';

    beforeEach(() => {
      jest.spyOn(craftRedux, 'closePlayerSelectionDialog').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('closes dialog after selecting a player', () => {
      jest
        .spyOn(craftRedux, 'openPlayerSelectionDialog')
        .mockImplementation(callback => callback('Steve'));

      utils.handlePlayerSelection(defaultPlayer, () => {});

      expect(craftRedux.openPlayerSelectionDialog).toHaveBeenCalledTimes(1);
      expect(craftRedux.closePlayerSelectionDialog).toHaveBeenCalledTimes(1);
    });

    it('invokes onComplete with selectedPlayer', () => {
      const selectedPlayer = 'Tom';
      jest
        .spyOn(craftRedux, 'openPlayerSelectionDialog')
        .mockImplementation(callback => callback(selectedPlayer));
      const onCompleteSpy = jest.fn();

      utils.handlePlayerSelection(defaultPlayer, onCompleteSpy);

      expect(onCompleteSpy).toHaveBeenCalledTimes(1);
      expect(onCompleteSpy).toHaveBeenCalledWith(selectedPlayer);
    });

    it('invokes callback with default player if no selectedPlayer is given', () => {
      jest
        .spyOn(craftRedux, 'openPlayerSelectionDialog')
        .mockImplementation(callback => callback(undefined));
      const onCompleteSpy = jest.fn();

      utils.handlePlayerSelection(defaultPlayer, onCompleteSpy);

      expect(onCompleteSpy).toHaveBeenCalledTimes(1);
      expect(onCompleteSpy).toHaveBeenCalledWith(defaultPlayer);
    });
  });
});
