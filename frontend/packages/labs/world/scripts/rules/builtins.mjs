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
