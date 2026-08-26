// Character sets: one AI-generated character kept as ONE animation whose
// sprite sheet holds several poses — standing, walking and jumping, each
// facing right and left — as named frame ranges, and the per-frame choice
// among them from how a sprite moved. The generator
// (ai/images/characterSet.ts) writes the ranges; the engine plays them.
//
// A set is a plain animation with a `poses` map, so everything that knows
// costumes by name — dropdowns, events, the World tab, rename, delete — sees
// one image with one name, and a sprite wearing it never changes label.

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

export interface CharacterPoseSpec {
  pose: CharacterPose;
  frameCount: number;
  frameDelay: number;
}

/**
 * The poses a set holds and how each plays. The generator asks for these
 * frames and the engine plays a set's frames at the rates stored with it;
 * both read the one table. Jump frames are not played on a clock in the game — the engine
 * picks the frame from the sprite's vertical speed (see jumpFrame) — so its
 * delay only paces the preview.
 *
 * The walk is drawn as one row picture and the model decides how many
 * frames the row holds: asked for eight it has drawn twelve, asked for four
 * or six it has drawn that many. Every frame it draws is kept, so the walk's
 * frameCount is the count asked for, and frameCount × frameDelay the cycle
 * time a set keeps whatever count it got (see poseFrameDelay): twelve frames
 * at two ticks and eight at three are the same walk.
 */
export const CHARACTER_POSES: CharacterPoseSpec[] = [
  {pose: 'stand', frameCount: 2, frameDelay: 20},
  {pose: 'walk', frameCount: 12, frameDelay: 2},
  {pose: 'jump', frameCount: 2, frameDelay: 8},
];

/**
 * The delay that gives a pose of `count` frames the cycle time of its spec:
 * a walk that came back as twelve frames plays each for two ticks, one that
 * came back as eight for three.
 */
export function poseFrameDelay(pose: CharacterPose, count: number): number {
  const spec = CHARACTER_POSES.find(p => p.pose === pose)!;
  return Math.max(1, Math.round((spec.frameCount * spec.frameDelay) / count));
}

/** Right first: the left-facing frames are drawn from the right-facing ones. */
export const CHARACTER_FACINGS: CharacterFacing[] = ['right', 'left'];

/**
 * The facings a set is generated for. Right only for now: left is the
 * right-facing frame mirrored at runtime (pickPose's fallback plus the
 * engine's mirrorX), which halves the pictures a set costs. Drawn left
 * frames — a staff staying in the same hand — are a matter of adding 'left'
 * back here.
 */
export const GENERATED_FACINGS: CharacterFacing[] = ['right'];

/** Every pose key in canonical order, right-facing first. */
export function orderedPoseKeys(poses: AnimationPoses): PoseKey[] {
  const keys: PoseKey[] = [];
  CHARACTER_FACINGS.forEach(facing =>
    CHARACTER_POSES.forEach(({pose}) => {
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
 * A set drawn facing right only (GENERATED_FACINGS) always lands on the
 * other facing for a left-moving sprite; the caller mirrors it.
 */
export function pickPose(
  poses: AnimationPoses,
  motion: CharacterMotion
): PickedPose | undefined {
  const wanted: CharacterPose = motion.airborne
    ? 'jump'
    : motion.moving
    ? 'walk'
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

export interface FramePose {
  pose: CharacterPose;
  facing: CharacterFacing;
  /** Position within the pose's range. */
  frame: number;
}

/** Which pose (and which of its frames) a sheet frame belongs to. */
export function poseForFrame(
  poses: AnimationPoses,
  sheetFrame: number
): FramePose | undefined {
  for (const [key, range] of Object.entries(poses)) {
    if (
      range &&
      sheetFrame >= range.start &&
      sheetFrame < range.start + range.count
    ) {
      const [pose, facing] = key.split('-') as [CharacterPose, CharacterFacing];
      return {pose, facing, frame: sheetFrame - range.start};
    }
  }
  return undefined;
}

/** The sheet frame to show `tick` draw cycles into a looping pose. */
export function poseFrame(range: PoseRange, tick: number): number {
  return range.start + (Math.floor(tick / range.frameDelay) % range.count);
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
