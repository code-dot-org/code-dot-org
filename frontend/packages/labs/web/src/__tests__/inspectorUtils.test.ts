import {describe, expect, it} from 'vitest';

import {
  computeLabelPosition,
  constrainToRange,
} from '../preview/inspectorUtils';

const VIEWPORT = {width: 1000, height: 800};
const LABEL = {width: 100, height: 20};

describe('inspectorUtils', () => {
  describe('constrainToRange', () => {
    it('returns the value when within range', () => {
      expect(constrainToRange(5, 0, 10)).toBe(5);
    });

    it('constrains below the minimum and above the maximum', () => {
      expect(constrainToRange(-1, 0, 10)).toBe(0);
      expect(constrainToRange(11, 0, 10)).toBe(10);
    });
  });

  describe('computeLabelPosition', () => {
    it('places the label above the box by default', () => {
      // Box mid-viewport: room above, so the label sits just above it,
      // left-aligned (top = box.top - labelHeight).
      const box = {top: 400, bottom: 450, left: 200};
      expect(computeLabelPosition(box, LABEL, VIEWPORT)).toEqual({
        top: 380,
        left: 200,
        pinned: false,
      });
    });

    it('places the label below the box when there is no room above', () => {
      // Box near the top: label would overflow the top, so it goes below.
      const box = {top: 10, bottom: 60, left: 200};
      expect(computeLabelPosition(box, LABEL, VIEWPORT)).toEqual({
        top: 60,
        left: 200,
        pinned: false,
      });
    });

    it('pins to the top-left of the box when it fits neither above nor below', () => {
      // Tall box filling the viewport: no room above or below.
      const box = {top: 10, bottom: 790, left: 200};
      expect(computeLabelPosition(box, LABEL, VIEWPORT)).toEqual({
        top: 10,
        left: 200,
        pinned: true,
      });
    });

    it('pins to the top-left-most VISIBLE point when the box overflows the viewport', () => {
      // Box extends past every edge: pin to the visible corner (0, 0).
      const box = {top: -50, bottom: 900, left: -30};
      expect(computeLabelPosition(box, LABEL, VIEWPORT)).toEqual({
        top: 0,
        left: 0,
        pinned: true,
      });
    });

    it('constrains the label horizontally so it stays on screen', () => {
      // Box near the right edge: left-aligning would overflow, so the label is
      // pulled left to viewport.width - label.width.
      const box = {top: 400, bottom: 450, left: 950};
      expect(computeLabelPosition(box, LABEL, VIEWPORT)).toEqual({
        top: 380,
        left: 900,
        pinned: false,
      });
    });
  });
});
