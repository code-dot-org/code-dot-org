// We have to include the locale files below as translations must be loaded in the global
// scope for HeadlessChrome to run properly.
import commonI18n from '@cdo/locale'; // eslint-disable-line no-unused-vars
import craftI18n from '@cdo/apps/craft/locale'; // eslint-disable-line no-unused-vars

import {expect} from '../../util/reconfiguredChai';
import sinon from 'sinon';
import * as utils from '@cdo/apps/craft/utils';
import * as craftRedux from '@cdo/apps/craft/redux';

describe('craft utils', () => {
  describe('handlePlayerSelection', () => {
    const defaultPlayer = 'Alex';

    beforeEach(() => {
      sinon.stub(craftRedux, 'closePlayerSelectionDialog');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('closes player selection dialog after opening', () => {
      sinon
        .stub(craftRedux, 'openPlayerSelectionDialog')
        .callsFake(callback => callback('Steve'));

      utils.handlePlayerSelection(defaultPlayer, () => {});

      expect(craftRedux.openPlayerSelectionDialog).to.have.been.calledOnce;
      expect(craftRedux.closePlayerSelectionDialog).to.have.been.calledOnce;
    });

    it('invokes onComplete with selectedPlayer', () => {
      const selectedPlayer = 'Tom';
      sinon
        .stub(craftRedux, 'openPlayerSelectionDialog')
        .callsFake(callback => callback(selectedPlayer));
      const onCompleteSpy = sinon.spy();

      utils.handlePlayerSelection(defaultPlayer, onCompleteSpy);

      expect(onCompleteSpy).to.have.been.calledOnceWith(selectedPlayer);
    });

    it('invokes callback with default player if no selectedPlayer is given', () => {
      sinon
        .stub(craftRedux, 'openPlayerSelectionDialog')
        .callsFake(callback => callback(undefined));
      const onCompleteSpy = sinon.spy();

      utils.handlePlayerSelection(defaultPlayer, onCompleteSpy);

      expect(onCompleteSpy).to.have.been.calledOnceWith(defaultPlayer);
    });
  });
});
