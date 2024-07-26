/** @file Tests for Game Lab helper methods that make decisions based on redux state */
import {
  allowAnimationMode,
  countAllowedModes,
} from '@cdo/apps/p5lab/stateQueries';

import {forEveryBooleanPermutation} from '../../util/testUtils';

describe('stateQueries', function () {
  describe('allowAnimationMode', function () {
    it('is never allowed if showAnimationMode is false', function () {
      forEveryBooleanPermutation((a, b, c) => {
        expect(
          allowAnimationMode(
            stateFromPageConstants({
              showAnimationMode: false,
              isEmbedView: a,
              isShareView: b,
              isReadOnlyWorkspace: c,
            })
          )
        ).toBe(false);
      });
    });

    it('is allowed if showAnimationMode is true', function () {
      expect(
        allowAnimationMode(
          stateFromPageConstants({
            showAnimationMode: true,
          })
        )
      ).toBe(true);
    });

    it('...unless isEmbedView', function () {
      forEveryBooleanPermutation(a => {
        expect(
          allowAnimationMode(
            stateFromPageConstants({
              showAnimationMode: a,
              isEmbedView: true,
            })
          )
        ).toBe(false);
      });
    });

    it('...or isShareView', function () {
      forEveryBooleanPermutation(a => {
        expect(
          allowAnimationMode(
            stateFromPageConstants({
              showAnimationMode: a,
              isShareView: true,
            })
          )
        ).toBe(false);
      });
    });

    it('...or isReadOnlyWorkspace', function () {
      forEveryBooleanPermutation(a => {
        expect(
          allowAnimationMode(
            stateFromPageConstants({
              showAnimationMode: a,
              isReadOnlyWorkspace: true,
            })
          )
        ).toBe(false);
      });
    });
  });

  describe('countAllowedModes', function () {
    it('is either 1 or 2, depending on whether animation mode is allowed', function () {
      forEveryBooleanPermutation(a => {
        const state = stateFromPageConstants({showAnimationMode: a});
        expect(countAllowedModes(state)).toBe(a ? 2 : 1);
      });
    });
  });
});

function stateFromPageConstants(pageConstants) {
  return {pageConstants};
}
