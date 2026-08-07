// The engine foundation's members, as the blocks that read them.
//
// Space and Appearance are not authored rules — `WorldBuilder` seeds them, so
// there is no `.mjs` here to import their declarations from. Their block types
// follow the same derivation as everyone's (`world_get_<RuleSlug>_<Export>`),
// so this is the one place a stock rule's source names one by hand.

const value = block => ({block});

/** `get position <x|y> of <subject>` — a point, so it reports one axis. */
export const position = {
  axis: (which, subject) => ({
    type: 'world_get_Space_PositionProperty',
    fields: {COMPONENT: which},
    inputs: {ACTOR: value(subject)},
  }),
};
position.x = subject => position.axis('x', subject);
position.y = subject => position.axis('y', subject);

/** `set position of <subject> x <…> y <…>` — the spatial setter, not a getter. */
export const setPosition = (subject, x, y) => ({
  type: 'world_set_position',
  inputs: {ACTOR: value(subject), X: value(x), Y: value(y)},
});

/** Physics' velocity — a whole vector, so its getter reports one. */
export const velocity = {
  of: subject => ({
    type: 'world_get_Physics_VelocityProperty',
    inputs: {ACTOR: value(subject)},
  }),
  set: (subject, v) => ({
    type: 'world_set_Physics_VelocityProperty',
    inputs: {ACTOR: value(subject), VALUE: value(v)},
  }),
};

/** What a `use trait` names, for the foundation's own. */
export const CanMove = 'Physics#CanMoveTrait';

/** What a `use trait` names, for Space's own. */
export const Positional = 'Space#PositionalTrait';

/** Space's own measurements of an actor, both points. */
const spacePoint = exportName => {
  const self = {
    axis: (which, subject) => ({
      type: `world_get_Space_${exportName}Property`,
      fields: {COMPONENT: which},
      inputs: {ACTOR: value(subject)},
    }),
  };
  self.x = subject => self.axis('x', subject);
  self.y = subject => self.axis('y', subject);
  return self;
};

/** How big the actor's picture is, before scaling. */
export const intrinsicSize = spacePoint('IntrinsicSize');
/** How much bigger or smaller it is drawn than that. */
export const scale = spacePoint('Scale');
