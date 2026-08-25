// Character sets: one AI-generated character kept as several animations —
// standing, walking and jumping, each facing right and left — and the
// per-frame choice among them from how a sprite moved. The generator
// (ai/images/characterSet.ts) writes the roles onto the animations; the
// engine reads them back to pick what to show.

import {IMAGE_NAME_MAX_LENGTH} from './imageReferences';

export type CharacterPose = 'stand' | 'walk' | 'jump';
export type CharacterFacing = 'right' | 'left';

/** Which member of a character set an animation is; stored on it. */
export interface CharacterRole {
  /** Shared by every member of one character. */
  id: string;
  pose: CharacterPose;
  facing: CharacterFacing;
}

export interface CharacterPoseSpec {
  pose: CharacterPose;
  frameCount: number;
  /** Draw cycles per frame (the sketch runs at 30 a second). */
  frameDelay: number;
  looping: boolean;
}

/**
 * The poses a set holds and how each plays. The generator asks for exactly
 * these frames and the engine plays them at these rates; both read the one
 * table. Jump frames are not played on a clock — the engine picks the frame
 * from the sprite's vertical speed (see jumpFrame).
 */
export const CHARACTER_POSES: CharacterPoseSpec[] = [
  {pose: 'stand', frameCount: 2, frameDelay: 15, looping: true},
  {pose: 'walk', frameCount: 8, frameDelay: 3, looping: true},
  {pose: 'jump', frameCount: 2, frameDelay: 1, looping: false},
];

/** Right first: the left-facing frames are drawn from the right-facing ones. */
export const CHARACTER_FACINGS: CharacterFacing[] = ['right', 'left'];

/**
 * The base member: the drawing the whole set is derived from, and the one
 * that carries the character's own name (so it is what the costume dropdowns
 * offer and what a program refers to).
 */
export function isBaseRole(role: Pick<CharacterRole, 'pose' | 'facing'>) {
  return role.pose === 'stand' && role.facing === 'right';
}

const POSE_WORDS: Record<CharacterPose, string> = {
  stand: 'standing',
  walk: 'walking',
  jump: 'jumping',
};

// The longest suffix characterAnimationName appends.
const LONGEST_SUFFIX = ` ${POSE_WORDS.stand} right`.length;

/** Room left for a character's name once every member's suffix must fit. */
export const CHARACTER_BASE_NAME_MAX_LENGTH =
  IMAGE_NAME_MAX_LENGTH - LONGEST_SUFFIX;

/** A member's image name: the base keeps the name; the rest say what they are. */
export function characterAnimationName(
  baseName: string,
  role: Pick<CharacterRole, 'pose' | 'facing'>
): string {
  if (isBaseRole(role)) {
    return baseName;
  }
  return `${baseName} ${POSE_WORDS[role.pose]} ${role.facing}`;
}

export type MemberKey = `${CharacterPose}-${CharacterFacing}`;

export function memberKey(
  pose: CharacterPose,
  facing: CharacterFacing
): MemberKey {
  return `${pose}-${facing}`;
}

/** The image names of one character's members, by pose and facing. */
export type CharacterMembers = Partial<Record<MemberKey, string>>;

interface IndexableAnimationList {
  orderedKeys: string[];
  propsByKey: {
    [key: string]: {name: string; character?: CharacterRole} | undefined;
  };
}

/**
 * Every set member's image name → its whole set, so a sprite wearing any
 * member finds the others.
 */
export function indexCharacterSets(
  list: IndexableAnimationList
): Map<string, CharacterMembers> {
  const byId = new Map<string, CharacterMembers>();
  list.orderedKeys.forEach(key => {
    const props = list.propsByKey[key];
    if (!props?.character) {
      return;
    }
    const members = byId.get(props.character.id) || {};
    members[memberKey(props.character.pose, props.character.facing)] =
      props.name;
    byId.set(props.character.id, members);
  });
  const byName = new Map<string, CharacterMembers>();
  byId.forEach(members => {
    Object.values(members).forEach(name => byName.set(name, members));
  });
  return byName;
}

export interface CharacterMotion {
  moving: boolean;
  airborne: boolean;
  facing: CharacterFacing;
}

/**
 * The member to show for a motion. A pose the set lacks falls back to
 * standing the same way before anything facing the other way: a
 * wrong-facing walk reads as moonwalking, a standing pose merely as stiff.
 */
export function pickCharacterAnimation(
  members: CharacterMembers,
  motion: CharacterMotion
): {name: string; pose: CharacterPose} | undefined {
  const wanted: CharacterPose = motion.airborne
    ? 'jump'
    : motion.moving
    ? 'walk'
    : 'stand';
  const facings: CharacterFacing[] =
    motion.facing === 'right' ? ['right', 'left'] : ['left', 'right'];
  for (const facing of facings) {
    for (const pose of [wanted, 'stand'] as CharacterPose[]) {
      const name = members[memberKey(pose, facing)];
      if (name) {
        return {name, pose};
      }
    }
  }
  return undefined;
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
 * Which jump frame to show: 0 while rising against gravity, 1 while falling.
 * Gravity may point up (negative), in which case rising means moving down.
 */
export function jumpFrame(velocityY: number, gravity: number): number {
  const rising = gravity >= 0 ? velocityY < 0 : velocityY > 0;
  return rising ? 0 : 1;
}
