import {assert} from '../../util/configuredChai';
import sinon from 'sinon';
import {getStore, registerReducers, stubRedux, restoreRedux} from '@cdo/apps/redux';
import pageConstants from '@cdo/apps/redux/pageConstants';
import Craft from '@cdo/apps/craft/code-connection/craft';

describe('Craft', () => {
  before(() => sinon.stub(Craft, 'render'));
  after(() => Craft.render.restore());

  beforeEach(stubRedux);
  afterEach(restoreRedux);

  it('app init', () => {
    registerReducers({pageConstants});
    const config = {
      level: {},
      skin: {},
    };
    Craft.init(config);
    assert(getStore().getState().pageConstants.isMinecraft);
  });
});
