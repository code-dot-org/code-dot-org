// Wave 2 (camera.md, CAM-) owns this module. It holds the camera state and
// the activation the frame lifecycle needs (LIF-10 item 3, LIF-15 item 2).
import type p5 from 'p5';

import {findContext} from './context';
import {makeVector} from './vector';

const initialised = new WeakSet<Camera>();
const instances = new WeakMap<Camera, p5>();

export class Camera {
  position: p5.Vector;
  zoom: number;
  mouseX: number;
  mouseY: number;
  active = false;

  constructor(p: p5, x: number, y: number, zoom: number) {
    instances.set(this, p);
    this.position = makeVector(p, x, y);
    this.zoom = zoom;
    const pointer = findContext(p)?.input;
    this.mouseX = pointer?.mouseX ?? 0;
    this.mouseY = pointer?.mouseY ?? 0;
  }

  get x(): number {
    return this.position.x;
  }

  set x(value: number) {
    this.position.x = value;
  }

  get y(): number {
    return this.position.y;
  }

  set y(value: number) {
    this.position.y = value;
  }

  isActive(): boolean {
    return this.active;
  }

  on(): void {
    if (!this.active) {
      activate(this);
    }
  }

  off(): void {
    if (this.active) {
      instances.get(this)!.pop();
      this.active = false;
    }
  }
}

/** CAM-9: steps 1 and 2 always; step 3 only when inactive. */
function activate(camera: Camera): void {
  const p = instances.get(camera)!;
  const halfWidth = p.width / 2;
  const halfHeight = p.height / 2;
  if (!initialised.has(camera) && camera.x === 0 && camera.y === 0) {
    camera.x = halfWidth;
    camera.y = halfHeight;
    initialised.add(camera);
  }
  const pointer = findContext(p)?.input;
  camera.mouseX = (pointer?.mouseX ?? 0) + camera.x - halfWidth;
  camera.mouseY = (pointer?.mouseY ?? 0) + camera.y - halfHeight;
  if (!camera.active) {
    p.push();
    p.scale(camera.zoom);
    p.translate(
      -camera.x + halfWidth / camera.zoom,
      -camera.y + halfHeight / camera.zoom,
    );
    camera.active = true;
  }
}

/** LIF-10 item 3. */
export function cameraPreDraw(camera: Camera): void {
  activate(camera);
}

/** LIF-15 item 2. */
export function cameraPostDraw(camera: Camera): void {
  camera.off();
}

/** `p.Camera`: the constructor bound to one instance (CAM-1). */
export function cameraConstructor(
  p: p5,
): new (x: number, y: number, zoom: number) => Camera {
  return class extends Camera {
    constructor(x: number, y: number, zoom: number) {
      super(p, x, y, zoom);
    }
  };
}
