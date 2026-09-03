// Character sets: one AI-generated character kept as ONE animation whose
// picture holds its poses as named frame ranges, and the per-frame choice
// among them from how a sprite moved. The generator
// (ai/images/characterSet.ts) writes the ranges; the engine plays them.
//
// A set is a plain animation with a `poses` map, so everything that knows
// costumes by name — dropdowns, events, the World tab, rename, delete — sees
// one image with one name, and a sprite wearing it never changes label.
//
// The `poses` map is also what marks the format: an animation WITHOUT one is
// a single picture at whatever size it is — hand-painted sprites, and every
// image made before character sets — and keeps playing as itself. Only an
// animation carrying `poses` is read as the strip below.

export type CharacterPose = 'stand' | 'walk' | 'jump';
export type CharacterFacing = 'right' | 'left';

export type PoseKey = `${CharacterPose}-${CharacterFacing}`;

export function poseKey(pose: CharacterPose, facing: CharacterFacing): PoseKey {
  return `${pose}-${facing}`;
}

/** Where one pose lives in its sheet: frames start..start+count-1. */
export interface PoseRange {
  start: number;
  count: number;
  /** Draw cycles per frame (the sketch runs at 30 a second). */
  frameDelay: number;
}

/** A character set's poses, stored on its animation. */
export type AnimationPoses = Partial<Record<PoseKey, PoseRange>>;

/** Pose order everywhere poses are listed. */
export const CHARACTER_POSE_ORDER: CharacterPose[] = ['stand', 'walk', 'jump'];

/**
 * The strip a generated set is stored as: one row of five square frames —
 * second idle, standing, mid-stride walk, rising jump, falling jump — all
 * facing right. The standing frame is shared: the idle alternates it with
 * the second idle, the walk alternates it with the mid-stride, which is
 * why it sits between them (ranges are contiguous). Jump frames are not
 * played on a clock in the game — the engine picks by vertical speed (see
 * jumpFrame) — so that delay only paces the preview. Left is the
 * right-facing frame mirrored at runtime (pickPose's fallback plus the
 * engine's mirrorX); drawn left frames — a staff staying in the same
 * hand — would be new `-left` ranges here.
 */
export const CHARACTER_STRIP_POSES: AnimationPoses = {
  'stand-right': {start: 0, count: 2, frameDelay: 20},
  'walk-right': {start: 1, count: 2, frameDelay: 8},
  'jump-right': {start: 3, count: 2, frameDelay: 8},
};

export const CHARACTER_STRIP_FRAME_COUNT = 5;

/** Right first: the left-facing frames are mirrored from the right ones. */
export const CHARACTER_FACINGS: CharacterFacing[] = ['right', 'left'];

/** Every pose key in canonical order, right-facing first. */
export function orderedPoseKeys(poses: AnimationPoses): PoseKey[] {
  const keys: PoseKey[] = [];
  CHARACTER_FACINGS.forEach(facing =>
    CHARACTER_POSE_ORDER.forEach(pose => {
      const key = poseKey(pose, facing);
      if (poses[key]) {
        keys.push(key);
      }
    })
  );
  return keys;
}

interface PosedAnimationList {
  orderedKeys: string[];
  propsByKey: {
    [key: string]: {name: string; poses?: AnimationPoses} | undefined;
  };
}

/** Image name → its poses, for every character set in the list. */
export function posesByImageName(
  list: PosedAnimationList
): Map<string, AnimationPoses> {
  const byName = new Map<string, AnimationPoses>();
  list.orderedKeys.forEach(key => {
    const props = list.propsByKey[key];
    if (props?.poses) {
      byName.set(props.name, props.poses);
    }
  });
  return byName;
}

export interface CharacterMotion {
  moving: boolean;
  airborne: boolean;
  /** Stopped with its toes over an edge: holds back in the jump frames. */
  teetering?: boolean;
  facing: CharacterFacing;
}

export interface PickedPose {
  key: PoseKey;
  pose: CharacterPose;
  /** The facing the frames were drawn in; mirror when it isn't the motion's. */
  facing: CharacterFacing;
  range: PoseRange;
}

/**
 * The pose to show for a motion. A pose the set lacks falls back to
 * standing the same way before anything facing the other way: a
 * wrong-facing walk reads as moonwalking, a standing pose merely as stiff.
 * A set drawn facing right only (the strip) always lands on the other
 * facing for a left-moving sprite; the caller mirrors it.
 */
export function pickPose(
  poses: AnimationPoses,
  motion: CharacterMotion
): PickedPose | undefined {
  const wanted: CharacterPose = motion.airborne
    ? 'jump'
    : motion.moving
    ? 'walk'
    : motion.teetering
    ? 'jump'
    : 'stand';
  const facings: CharacterFacing[] =
    motion.facing === 'right' ? ['right', 'left'] : ['left', 'right'];
  for (const facing of facings) {
    for (const pose of [wanted, 'stand'] as CharacterPose[]) {
      const key = poseKey(pose, facing);
      const range = poses[key];
      if (range) {
        return {key, pose, facing, range};
      }
    }
  }
  return undefined;
}

/** The sheet frame to show `tick` draw cycles into a looping pose. */
export function poseFrame(range: PoseRange, tick: number): number {
  return range.start + (Math.floor(tick / range.frameDelay) % range.count);
}

/**
 * How long a player that stops with its toes over an edge holds back — the
 * jump pose's first frame, the crouch-and-rise, held for as long as the pose
 * would take to play once — before it stands. The falling frame is left
 * out: arms out and legs flung read as a leap, not a lean.
 */
export function teeterTicks(range: PoseRange): number {
  return range.frameDelay * range.count;
}

// Horizontal movement below this, per frame, counts as standing still: the
// platform resolver leaves sub-pixel float noise on a resting sprite.
export const MOVE_EPSILON = 0.01;

export function isMoving(dx: number): boolean {
  return Math.abs(dx) > MOVE_EPSILON;
}

/** A sprite turns with its movement and otherwise keeps facing as it was. */
export function nextFacing(
  previous: CharacterFacing,
  dx: number
): CharacterFacing {
  if (!isMoving(dx)) {
    return previous;
  }
  return dx > 0 ? 'right' : 'left';
}

/**
 * Which jump frame to show, within its range: 0 while rising against
 * gravity, 1 while falling. Gravity may point up (negative), in which case
 * rising means moving down.
 */
export function jumpFrame(velocityY: number, gravity: number): number {
  const rising = gravity >= 0 ? velocityY < 0 : velocityY > 0;
  return rising ? 0 : 1;
}
