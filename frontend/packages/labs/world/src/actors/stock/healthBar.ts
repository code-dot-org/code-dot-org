// "Health Bar" — a Progress Bar pointed at somebody.
//
// The Button's shape, one shelf along: a Button is a Label that elects one more
// trait, and this is a Progress Bar that elects two. Its picture is the Progress
// Bar's picture, unchanged and shared, because a health bar IS a progress bar —
// what makes it a health bar is where its number comes from, and that is a
// trait rather than a drawing (specs/UI_ACTORS.md).
//
// POINT IT ONCE and it does both jobs:
//
//     set attached to of ⟨any ⟨Health Bar⟩⟩ to ⟨this actor⟩
//
// which puts it over that actor and makes it show that actor's health. Two
// properties for one intention would be two chances to disagree, and a bar
// hovering over one thing while reporting another is a bug nobody would think
// to look for (`rules/healthBar`).
//
// IT IS ONE PER SUBJECT, not one per game. Bars over three enemies are three
// of these, each attached to one of them — which is what makes them an ACTOR
// rather than a thing the engine draws: they are placed, moved and removed
// like anything else.

import {progressBarDrawing} from './progressBar';
import {actorFile, showAs, useTrait} from './workspace';

export const healthBarActor = actorFile(
  'Health Bar',
  [
    // The two the join needs, and the join. `Shows Health` declares the first
    // two as its own dependencies, so electing it alone would do — they are
    // written out because a learner opening this file should be able to read
    // what it is made of without following a rule to find out.
    useTrait('Progress#ShowsProgressTrait'),
    useTrait('Attachment#AttachedTrait'),
    useTrait('Health Bar#ShowsHealthTrait'),
    showAs('bar'),
  ],
  progressBarDrawing(),
);
