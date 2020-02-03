import {expect} from '../../../util/deprecatedChai';

import * as elementUtils from '@cdo/apps/applab/designElements/elementUtils';

describe('Applab designElements/elementUtils', function() {
  describe('calculatePadding', () => {
    it('returns (0,0) for empty padding string', () => {
      const {
        verticalPadding,
        horizontalPadding
      } = elementUtils.calculatePadding('');
      expect(verticalPadding).is.equal(0);
      expect(horizontalPadding).is.equal(0);
    });

    it('returns (0,0) for undefined padding string', () => {
      const {
        verticalPadding,
        horizontalPadding
      } = elementUtils.calculatePadding();
      expect(verticalPadding).is.equal(0);
      expect(horizontalPadding).is.equal(0);
    });

    it('returns (0,0) for "0" padding string', () => {
      const {
        verticalPadding,
        horizontalPadding
      } = elementUtils.calculatePadding('0');
      expect(verticalPadding).is.equal(0);
      expect(horizontalPadding).is.equal(0);
    });

    it('returns (0,0) for "0px" padding string', () => {
      const {
        verticalPadding,
        horizontalPadding
      } = elementUtils.calculatePadding('0px');
      expect(verticalPadding).is.equal(0);
      expect(horizontalPadding).is.equal(0);
    });

    it('returns (0,0) for "0 0px" padding string', () => {
      const {
        verticalPadding,
        horizontalPadding
      } = elementUtils.calculatePadding('0 0px');
      expect(verticalPadding).is.equal(0);
      expect(horizontalPadding).is.equal(0);
    });

    it('returns (0,0) for "0px 0" padding string', () => {
      const {
        verticalPadding,
        horizontalPadding
      } = elementUtils.calculatePadding('0px 0');
      expect(verticalPadding).is.equal(0);
      expect(horizontalPadding).is.equal(0);
    });

    it('returns (2,0) for "1px 0" padding string', () => {
      const {
        verticalPadding,
        horizontalPadding
      } = elementUtils.calculatePadding('1px 0');
      expect(verticalPadding).is.equal(2);
      expect(horizontalPadding).is.equal(0);
    });

    it('returns (0,2) for "0 1px" padding string', () => {
      const {
        verticalPadding,
        horizontalPadding
      } = elementUtils.calculatePadding('0 1px');
      expect(verticalPadding).is.equal(0);
      expect(horizontalPadding).is.equal(2);
    });

    it('returns (2,2) for "1px 1px" padding string', () => {
      const {
        verticalPadding,
        horizontalPadding
      } = elementUtils.calculatePadding('1px 1px');
      expect(verticalPadding).is.equal(2);
      expect(horizontalPadding).is.equal(2);
    });

    it('returns (3,0) for "1px 0 2px" padding string', () => {
      const {
        verticalPadding,
        horizontalPadding
      } = elementUtils.calculatePadding('1px 0 2px');
      expect(verticalPadding).is.equal(3);
      expect(horizontalPadding).is.equal(0);
    });

    it('returns (3,7) for "1px 0 2px 7px" padding string', () => {
      const {
        verticalPadding,
        horizontalPadding
      } = elementUtils.calculatePadding('1px 0 2px 7px');
      expect(verticalPadding).is.equal(3);
      expect(horizontalPadding).is.equal(7);
    });

    it('returns (3,17) for "1px 10px 2px 7px" padding string', () => {
      const {
        verticalPadding,
        horizontalPadding
      } = elementUtils.calculatePadding('1px 10px 2px 7px');
      expect(verticalPadding).is.equal(3);
      expect(horizontalPadding).is.equal(17);
    });
  });
});
