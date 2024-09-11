import reducer, {
  setInitialAnimationList,
  animationSourceUrl,
} from '@cdo/apps/p5lab/redux/animationList';
import {costumeList, customInputTypes} from '@cdo/apps/p5lab/spritelab/blocks';
import {
  registerReducers,
  stubRedux,
  restoreRedux,
  getStore,
} from '@cdo/apps/redux';
import commonReducers from '@cdo/apps/redux/commonReducers';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';

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
      stubRedux();
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
      restoreRedux();
    });

    it('returns sourceUrl array for both library and drawn costumes', () => {
      let items = costumeList();
      expect(items.length).toBe(2);
      expect(items[0]).toEqual([
        animationSourceUrl(
          '1',
          animationList.propsByKey['1'],
          getStore().getState().pageConstants.channelId
        ),
        '"drawn"',
      ]);
      expect(items[1]).toEqual(['/v3/library/test.png', '"library"']);
    });
  });
});

describe('Custom Input Types', () => {
  describe('soundPicker.generateCode()', () => {
    it('returns a valid json string with quotes escaped', () => {
      const block = {
        getFieldValue: function (arg) {
          return arg;
        },
      };
      const arg = {name: "te'st"};
      expect(customInputTypes['soundPicker'].generateCode(block, arg)).toEqual(
        `"te\'st"`
      );
    });
  });
});
