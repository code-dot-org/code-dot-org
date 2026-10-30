import {
  insertCollider,
  isBlockAtEdge,
  isOverlapping,
} from '@cdo/apps/blockly/utils/workspace/layout';

describe('workspace layout utils', () => {
  describe('insertCollider', () => {
    it('should insert the collider at the correct position', () => {
      const colliders = [
        {y: 0, height: 10},
        {y: 20, height: 10},
        {y: 40, height: 10},
      ];
      const item = {y: 30, height: 10};

      insertCollider(colliders, item);
      expect(colliders).toEqual([
        {y: 0, height: 10},
        {y: 20, height: 10},
        {y: 30, height: 10},
        {y: 40, height: 10},
      ]);
    });

    it('should insert the collider at the end if it is the lowest', () => {
      const colliders = [
        {y: 0, height: 10},
        {y: 20, height: 10},
        {y: 40, height: 10},
      ];
      const item = {y: 50, height: 10};

      insertCollider(colliders, item);
      expect(colliders).toEqual([
        {y: 0, height: 10},
        {y: 20, height: 10},
        {y: 40, height: 10},
        {y: 50, height: 10},
      ]);
    });

    it('should insert the collider at the beginning if it is the highest', () => {
      const colliders = [
        {y: 20, height: 10},
        {y: 40, height: 10},
      ];
      const item = {y: 0, height: 10};

      insertCollider(colliders, item);
      expect(colliders).toEqual([
        {y: 0, height: 10},
        {y: 20, height: 10},
        {y: 40, height: 10},
      ]);
    });
  });

  describe('isBlockAtEdge', () => {
    const viewWidth = 515;
    const arbitraryCoordinates = {x: 20, y: 140};
    const defaultLTRCoordinates = {x: 0, y: 0};
    const defaultRTLCoordinates = {x: viewWidth, y: 0};

    let block, result;
    const workspaceLTR = {RTL: false, getMetrics: () => ({viewWidth})};
    const workspaceRTL = {RTL: true, getMetrics: () => ({viewWidth})};

    it('should return true for a block at (0, 0) on a LTR workspace', () => {
      block = {
        workspace: workspaceLTR,
        getRelativeToSurfaceXY: () => defaultLTRCoordinates,
      };

      result = isBlockAtEdge(block);
      expect(result).toBe(true);
    });

    it('should return true for a block at either x=0 or y=0 on a LTR workspace', () => {
      block = {
        workspace: workspaceLTR,
        getRelativeToSurfaceXY: () => ({
          x: defaultLTRCoordinates.x,
          y: arbitraryCoordinates.y,
        }),
      };
      result = isBlockAtEdge(block);
      expect(result).toBe(true);

      block = {
        workspace: workspaceLTR,
        getRelativeToSurfaceXY: () => ({
          x: arbitraryCoordinates.x,
          y: defaultLTRCoordinates.y,
        }),
      };
      result = isBlockAtEdge(block);
      expect(result).toBe(true);
    });

    it('should return false for a block at specific coordinates on a LTR workspace', () => {
      block = {
        workspace: workspaceLTR,
        getRelativeToSurfaceXY: () => arbitraryCoordinates,
      };

      result = isBlockAtEdge(block);
      expect(result).toBe(false);
    });

    it('should return true for a block at the top-right corner of an RTL workspace', () => {
      block = {
        workspace: workspaceRTL,
        getRelativeToSurfaceXY: () => defaultRTLCoordinates,
      };

      result = isBlockAtEdge(block);
      expect(result).toBe(true);
    });

    it('should return true for a block at either x=width or y=0 on a RTL workspace', () => {
      block = {
        workspace: workspaceRTL,
        getRelativeToSurfaceXY: () => ({
          x: defaultRTLCoordinates.x,
          y: arbitraryCoordinates.y,
        }),
      };
      result = isBlockAtEdge(block);
      expect(result).toBe(true);

      block = {
        workspace: workspaceRTL,
        getRelativeToSurfaceXY: () => ({
          x: arbitraryCoordinates.x,
          y: defaultRTLCoordinates.y,
        }),
      };
      result = isBlockAtEdge(block);
      expect(result).toBe(true);
    });

    it('should return false for a block at specific coordinates of an RTL workspace', () => {
      block = {
        workspace: workspaceRTL,
        getRelativeToSurfaceXY: () => arbitraryCoordinates,
      };

      result = isBlockAtEdge(block);
      expect(result).toBe(false);
    });
  });

  describe('isOverlapping', () => {
    it('should return true when colliders overlap', () => {
      const collider1 = {x: 0, y: 0, width: 10, height: 10};
      const collider2 = {x: 5, y: 5, width: 10, height: 10};

      const result = isOverlapping(collider1, collider2);
      expect(result).toBe(true);
    });

    it('should return true when one collider is completely inside the other', () => {
      const collider1 = {x: 0, y: 0, width: 20, height: 20};
      const collider2 = {x: 5, y: 5, width: 10, height: 10};

      const result = isOverlapping(collider1, collider2);
      expect(result).toBe(true);
    });

    it('should return false when colliders only touch but do not overlap', () => {
      const collider1 = {x: 0, y: 0, width: 10, height: 10};
      const collider2 = {x: 10, y: 10, width: 10, height: 10};

      const result = isOverlapping(collider1, collider2);
      expect(result).toBe(false);
    });

    it('should return false when colliders do not overlap', () => {
      const collider1 = {x: 0, y: 0, width: 10, height: 10};
      const collider2 = {x: 20, y: 20, width: 10, height: 10};

      const result = isOverlapping(collider1, collider2);
      expect(result).toBe(false);
    });
  });
});
