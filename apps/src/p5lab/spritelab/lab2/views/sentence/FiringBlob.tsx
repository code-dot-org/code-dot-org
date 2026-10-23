// A soft blob of dots with signals pulsing along the links between them,
// shown in the picture frame while a picture is made.

import React, {useEffect, useRef} from 'react';

import {reducedMotion} from '@cdo/apps/p5lab/spritelab/lab2/reducedMotion';

import styles from './firing-blob.module.scss';

interface FiringBlobProps {
  /** Signal colors as #rrggbb; the neutral stands in when empty. */
  colors: string[];
}

interface Node {
  x: number;
  y: number;
  /** Where the node rests; it drifts a little around here. */
  homeX: number;
  homeY: number;
  /** Its own phase and pace, so no two nodes drift in step. */
  phase: number;
  pace: number;
  glow: number;
  color: string;
  links: number[];
}

// How far a node wanders from home, px, and how fast: well under the
// spacing between nodes, so the net keeps its shape.
const DRIFT_PX = 1.6;
const DRIFT_RATE = 0.0006;

interface Pulse {
  from: number;
  to: number;
  /** Progress from `from` to `to`, 0 to 1. */
  u: number;
  color: string;
  depth: number;
  speed: number;
}

// The design's own size; it is scaled to fit the canvas and centered.
const WIDTH = 230;
const HEIGHT = 180;
const CENTER_X = 115;
const CENTER_Y = 90;
const BLOB_RADIUS = 66;
const BLOB_STRETCH = 1.25;
const GLOW_RADIUS = 84;
const NODE_COUNT = 54;
const PLACE_TRIES = 4000;
const MIN_SPACING = 15;
const LINK_RANGE = 34;
const MAX_LINKS = 3;
const MAX_DEPTH = 4;
const FIRE_EVERY_MS = 520;
const MAX_PULSES = 26;
const STATIC_LIT = 6;
const MAX_STEP_MS = 64;
// Lavender haze, soft enough to sit on the light and the dark frame alike.
const GLOW_RGB = '172, 168, 234';
// Mid gray, for when the dialog's theme tokens are out of reach.
const NEUTRAL_FALLBACK = '#9aa0b2';

const random = (min: number, max: number) => min + Math.random() * (max - min);

// A wobbly ellipse with no outline: dots are only placed inside it.
function inBlob(x: number, y: number): boolean {
  const dx = (x - CENTER_X) / BLOB_STRETCH;
  const dy = y - CENTER_Y;
  const angle = Math.atan2(dy, dx);
  const edge =
    BLOB_RADIUS *
    (1 + 0.07 * Math.sin(2 * angle + 0.6) + 0.045 * Math.sin(3 * angle + 1.7));
  return Math.hypot(dx, dy) < edge;
}

function buildNet(neutral: string): Node[] {
  const nodes: Node[] = [];
  for (let i = 0; i < PLACE_TRIES && nodes.length < NODE_COUNT; i++) {
    const x = random(14, WIDTH - 14);
    const y = random(10, HEIGHT - 10);
    if (
      inBlob(x, y) &&
      !nodes.some(n => Math.hypot(n.x - x, n.y - y) < MIN_SPACING)
    ) {
      nodes.push({
        x,
        y,
        homeX: x,
        homeY: y,
        phase: random(0, Math.PI * 2),
        pace: random(0.7, 1.3),
        glow: 0,
        color: neutral,
        links: [],
      });
    }
  }
  nodes.forEach((a, ia) => {
    nodes
      .map((b, ib) => ({ib, d: Math.hypot(a.x - b.x, a.y - b.y)}))
      .filter(o => o.ib !== ia && o.d < LINK_RANGE)
      .sort((u, v) => u.d - v.d)
      .slice(0, MAX_LINKS)
      .forEach(({ib}) => {
        if (!a.links.includes(ib)) {
          a.links.push(ib);
        }
        if (!nodes[ib].links.includes(ia)) {
          nodes[ib].links.push(ia);
        }
      });
  });
  return nodes;
}

// Lights a node and sends up to two pulses on, never straight back.
function fire(
  nodes: Node[],
  pulses: Pulse[],
  at: number,
  color: string,
  depth: number,
  from: number
) {
  const node = nodes[at];
  node.glow = 1;
  node.color = color;
  if (depth >= MAX_DEPTH) {
    return;
  }
  node.links
    .filter(k => k !== from)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
    .forEach((to, i) => {
      if (Math.random() < (i === 0 ? 0.9 : 0.55)) {
        pulses.push({
          from: at,
          to,
          u: 0,
          color,
          depth: depth + 1,
          speed: random(0.0014, 0.002),
        });
      }
    });
}

// How quickly the swell follows the net's activity, ms: a firing lights
// a node at once, and the swell must not jump with it.
const SWELL_LAG_MS = 400;

function drawNet(
  ctx: CanvasRenderingContext2D,
  nodes: Node[],
  pulses: Pulse[],
  neutral: string,
  now: number,
  dt: number,
  still: boolean,
  swell: {activity: number}
) {
  const activity = nodes.reduce((sum, n) => sum + n.glow, 0);
  swell.activity +=
    (activity - swell.activity) * Math.min(1, dt / SWELL_LAG_MS);
  const breathe = still
    ? 1
    : 1 +
      Math.sin(now * 0.0016) * 0.03 +
      Math.min(0.03, swell.activity * 0.002);
  if (!still) {
    nodes.forEach(n => {
      const t = now * DRIFT_RATE * n.pace + n.phase;
      n.x = n.homeX + Math.sin(t) * DRIFT_PX;
      n.y = n.homeY + Math.cos(t * 1.3) * DRIFT_PX;
    });
  }
  ctx.save();
  ctx.translate(CENTER_X, CENTER_Y);
  ctx.scale(breathe, breathe);
  ctx.translate(-CENTER_X, -CENTER_Y);

  ctx.save();
  ctx.translate(CENTER_X, CENTER_Y);
  ctx.scale(BLOB_STRETCH, 1);
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, GLOW_RADIUS);
  const haze = (0.2 + Math.min(0.22, activity * 0.012)).toFixed(2);
  glow.addColorStop(0, `rgba(${GLOW_RGB}, ${haze})`);
  glow.addColorStop(1, `rgba(${GLOW_RGB}, 0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, GLOW_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = neutral;
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 0.2;
  ctx.lineWidth = 1;
  nodes.forEach((a, ia) => {
    a.links.forEach(ib => {
      if (ib > ia) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(nodes[ib].x, nodes[ib].y);
        ctx.stroke();
      }
    });
  });
  ctx.globalAlpha = 1;

  pulses.forEach(p => {
    const a = nodes[p.from];
    const b = nodes[p.to];
    const x = a.x + (b.x - a.x) * p.u;
    const y = a.y + (b.y - a.y) * p.u;
    const tail = Math.max(0, p.u - 0.35);
    const tx = a.x + (b.x - a.x) * tail;
    const ty = a.y + (b.y - a.y) * tail;
    const trail = ctx.createLinearGradient(tx, ty, x, y);
    trail.addColorStop(0, `${p.color}00`);
    trail.addColorStop(1, p.color);
    ctx.strokeStyle = trail;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  nodes.forEach(n => {
    n.glow = Math.max(0, n.glow - dt * 0.0013);
    if (n.glow > 0.02) {
      ctx.globalAlpha = n.glow * 0.5;
      ctx.fillStyle = n.color;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 3 + n.glow * 8, 0, Math.PI * 2);
      ctx.fill();
    }
    const lit = n.glow > 0.15;
    ctx.globalAlpha = lit ? 1 : 0.7;
    ctx.fillStyle = lit ? n.color : neutral;
    ctx.beginPath();
    ctx.arc(n.x, n.y, lit ? 3 : 2.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
  ctx.restore();
}

/**
 * Fills its box and keeps the blob centered in it. Under reduced motion it
 * draws one calm frame with a few lit dots.
 */
const FiringBlob: React.FunctionComponent<FiringBlobProps> = ({colors}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Read through a ref: a change of colors must not rebuild the net.
  const colorsRef = useRef(colors);
  colorsRef.current = colors;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return;
    }
    const still = reducedMotion();
    const neutral =
      getComputedStyle(canvas)
        .getPropertyValue('--text-neutral-secondary')
        .trim() || NEUTRAL_FALLBACK;
    const signalColor = (i: number) => colorsRef.current[i] ?? neutral;
    const nodes = buildNet(neutral);
    let pulses: Pulse[] = [];

    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      const scale = Math.min(width / WIDTH, height / HEIGHT);
      ctx.setTransform(
        dpr * scale,
        0,
        0,
        dpr * scale,
        (dpr * (width - WIDTH * scale)) / 2,
        (dpr * (height - HEIGHT * scale)) / 2
      );
    };
    const swell = {activity: 0};
    const draw = (now: number, dt: number) => {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      drawNet(ctx, nodes, pulses, neutral, now, dt, still, swell);
    };

    let frame = 0;
    let last = 0;
    let lastFire = 0;
    const tick = (now: number) => {
      const dt = last ? Math.min(MAX_STEP_MS, now - last) : 0;
      last = now;
      if (now - lastFire > FIRE_EVERY_MS && pulses.length < MAX_PULSES) {
        lastFire = now;
        const at = Math.floor(Math.random() * nodes.length);
        const pick = Math.floor(
          Math.random() * Math.max(1, colorsRef.current.length)
        );
        fire(nodes, pulses, at, signalColor(pick), 0, -1);
      }
      pulses = pulses.filter(p => {
        p.u += p.speed * dt;
        if (p.u >= 1) {
          fire(nodes, pulses, p.to, p.color, p.depth, p.from);
          return false;
        }
        return true;
      });
      draw(now, dt);
      frame = requestAnimationFrame(tick);
    };
    const drawStill = () => {
      for (let k = 0; k < STATIC_LIT; k++) {
        const n = nodes[(k * 7) % nodes.length];
        n.glow = 0.9;
        n.color = signalColor(k % Math.max(1, colorsRef.current.length));
      }
      draw(0, 0);
    };

    fit();
    if (still) {
      drawStill();
    } else {
      frame = requestAnimationFrame(tick);
    }
    const observer =
      typeof ResizeObserver === 'function'
        ? new ResizeObserver(() => {
            fit();
            if (still) {
              drawStill();
            }
          })
        : undefined;
    observer?.observe(canvas);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.blob} aria-hidden />;
};

export default FiringBlob;
