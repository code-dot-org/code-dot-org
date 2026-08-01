// The Input rule ("Responds to Input") — lets an Actor be driven by the
// keyboard. The engine is DOM-free: the driver reads the real keyboard and
// hands the pressed keys to the World each frame (`World.setInput`), and this
// rule's step consults `World.isKeyDown` to move controlled actors.
//
// "Controlled by Arrow Keys" sets only the horizontal velocity, leaving the
// vertical component to whatever else is in play (e.g. gravity), so it composes
// into a simple platformer rather than fighting the fall.

import {RuleBuilder} from '../builders/RuleBuilder';
import {Vector} from '../core/Vector';

import {
  MotionRule,
  MovableTrait,
  RepositionStep,
  VelocityProperty,
} from './motion';

const rule = new RuleBuilder({id: 'input', name: 'Responds to Input'});
rule.requires([MotionRule]);

export const ControlledByArrowsTrait = rule.addTrait({
  id: 'arrowControlled',
  name: 'Controlled by Arrow Keys',
});
// Moving writes velocity, so the actor must be able to move.
ControlledByArrowsTrait.requires([MovableTrait]);

/** Horizontal speed, in units per second (core/units), while an arrow is held. */
export const MoveSpeedProperty = ControlledByArrowsTrait.addProperty(
  'moveSpeed',
  'number',
  1.5,
  {name: 'move speed'},
);

// Runs before Motion integrates velocity into position, so a key held this
// frame moves the actor this frame.
export const ControlStep = rule.addStepBefore(
  'control',
  RepositionStep,
  world => {
    for (const actor of world.actors.with(ControlledByArrowsTrait)) {
      const speed = actor.get(MoveSpeedProperty);
      let vx = 0;
      if (world.isKeyDown('ArrowLeft')) {
        vx -= speed;
      }
      if (world.isKeyDown('ArrowRight')) {
        vx += speed;
      }
      // Preserve the vertical component (gravity et al. own it).
      const velocity = actor.get(VelocityProperty);
      actor.set(VelocityProperty, new Vector(vx, velocity.y));
    }
  },
);

// Key events — the edge-triggered side of input. Polling (`isKeyDown`, above)
// answers "is it held now?"; these answer "did it just go down / come up?", so a
// handler runs once per press rather than every frame the key is held.
export const KeyPressedEvent = rule.addEvent('keyPressed', {
  name: 'a key is pressed',
});
export const KeyReleasedEvent = rule.addEvent('keyReleased', {
  name: 'a key is released',
});

// Diff the driver's per-frame key set against the previous frame's and raise an
// event on each rising/falling edge. The detail is the key name; the event is
// broadcast to every actor (a key press isn't owned by one actor), and each
// actor's handler filters for the key it cares about.
export const KeyEventStep = rule.addStep('keyEvents', world => {
  const pressed = world.newlyPressedKeys();
  const released = world.newlyReleasedKeys();
  if (pressed.length === 0 && released.length === 0) {
    return;
  }
  for (const actor of world.actors) {
    for (const key of pressed) {
      world.emit(KeyPressedEvent, actor, key);
    }
    for (const key of released) {
      world.emit(KeyReleasedEvent, actor, key);
    }
  }
});

export const InputRule = rule.build();
