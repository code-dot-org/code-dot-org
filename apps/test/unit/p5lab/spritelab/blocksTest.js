import {expect} from '../../../util/reconfiguredChai';
import {costumeList} from '@cdo/apps/p5lab/spritelab/blocks';
import {
  registerReducers,
  __testing_stubRedux,
  __testing_restoreRedux,
  getStore,
} from '@cdo/apps/redux';
import reducer, {
  setInitialAnimationList,
  animationSourceUrl,
} from '@cdo/apps/p5lab/redux/animationList';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';
import commonReducers from '@cdo/apps/redux/commonReducers';

describe('Gamelab blocks', () => {
  describe('costumeList()', () => {
    let animationList = {
      orderedKeys: ['1', '2'],
      propsByKey: {
        1: {
          sourceUrl: null,
          name: 'drawn',
          frameSize: 0,
          frameCount: 1,
          looping: false,
          frameDelay: 0,
        },
        2: {
          sourceUrl: '/v3/library/test.png',
          name: 'library',
          frameSize: 0,
          frameCount: 1,
          looping: false,
          frameDelay: 0,
        },
      },
    };

    beforeEach(() => {
      __testing_stubRedux();
      registerReducers({animationList: reducer});
      registerReducers(commonReducers);
      getStore().dispatch(
        setPageConstants({
          channelId: 'a1',
        })
      );
      getStore().dispatch(setInitialAnimationList(animationList));
    });

    afterEach(() => {
      __testing_restoreRedux();
    });

    it('returns sourceUrl array for both library and drawn costumes', () => {
      let items = costumeList();
      expect(items.length).to.equal(2);
      expect(items[0]).to.deep.equal([
        animationSourceUrl(
          '1',
          animationList.propsByKey['1'],
          getStore().getState().pageConstants.channelId
        ),
        '"drawn"',
      ]);
      expect(items[1]).to.deep.equal(['/v3/library/test.png', '"library"']);
    });
  });
});
