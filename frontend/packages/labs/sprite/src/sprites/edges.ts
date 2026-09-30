import type {Group} from './Group';
import type {SpriteP5} from './types';

const THICKNESS = 100;

/** WLD-16, WLD-17. */
export function createEdgeSprites(p: SpriteP5): Group {
  if (p.edges) {
    return p.edges;
  }
  const w = p.width;
  const h = p.height;
  const t = THICKNESS;
  p.leftEdge = p.createSprite(-t / 2, h / 2, t, h);
  p.rightEdge = p.createSprite(w + t / 2, h / 2, t, h);
  p.topEdge = p.createSprite(w / 2, -t / 2, w, t);
  p.bottomEdge = p.createSprite(w / 2, h + t / 2, w, t);
  const edges = p.createGroup();
  edges.add(p.leftEdge);
  edges.add(p.rightEdge);
  edges.add(p.topEdge);
  edges.add(p.bottomEdge);
  p.edges = edges;
  return edges;
}
