import {SHEET_POSES} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/characterSet';
import {
  figureKey,
  poseFigureSvg,
  poseFigureSvgDataURI,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/poseFigures';
import {CHARACTER_POSES} from '@cdo/apps/p5lab/spritelab/lab2/characterAnimations';

describe('SpriteLab2 poseFigures', () => {
  it('draws a distinct figure for every frame drawn from a figure', () => {
    // A pose drawn as one row picture takes no figures; its walk figures
    // repeat after eight frames and are only shown, never sent.
    const figurePoses = CHARACTER_POSES.filter(
      p => !SHEET_POSES.includes(p.pose)
    );
    const seen = new Set<string>();
    figurePoses.forEach(({pose, frameCount}) => {
      for (let frame = 0; frame < frameCount; frame++) {
        const svg = poseFigureSvg(pose, frame);
        expect(svg.startsWith('<svg')).toBe(true);
        // Torso and neck, two legs of three segments, two arms of two, and the

        // near arm's halo.
        expect(svg.match(/<polyline/g)).toHaveLength(2 + 2 * 3 + 3 * 2);
        expect(svg.match(/<circle/g)).toHaveLength(1);
        seen.add(svg);
      }
    });
    const total = figurePoses.reduce((n, p) => n + p.frameCount, 0);
    expect(seen.size).toBe(total);
  });

  it('swaps the legs between the two halves of the walk', () => {
    const first = figureKey('walk', 0);
    const second = figureKey('walk', 4);
    expect(second.nearLeg).toEqual(first.farLeg);
    expect(second.farLeg).toEqual(first.nearLeg);
    expect(second.nearArm).toEqual(first.farArm);
  });

  it('mirrors a left-facing figure', () => {
    expect(poseFigureSvg('walk', 0, 'left')).toContain('scale(-1,1)');
    expect(poseFigureSvg('walk', 0, 'right')).not.toContain('scale(-1,1)');
  });

  it('offers the figure as an SVG data URI', () => {
    const uri = poseFigureSvgDataURI('walk', 2, 'right');
    expect(uri.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
    expect(decodeURIComponent(uri.split(',')[1])).toBe(
      poseFigureSvg('walk', 2)
    );
  });
});
