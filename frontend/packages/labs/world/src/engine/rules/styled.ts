// Which theme an actor is painted out of, when it is not the world's.
//
// A drawing says `use style ⟨button⟩` and never names a file; WHICH file that
// class is looked up in cascades — the main world sets the base, a map may
// override it, and a placement may override that (specs/STYLES_PLAN.md). This
// is the last of the three, and it is a trait for the reason the box is one:
// several kinds mean exactly the same thing by it, and the map editor wants to
// ask "can this carry a theme" without knowing any of their names.
//
// A FOUNDATION RULE, like Boxed, so nothing has to import it. An inspector
// cannot ask whether a project happened to import the rule that lets a button
// be the red one.
//
// ELECTED, NOT SEEDED. A Coin has no theme and should not grow a row in its
// inspector saying so: this is for the kinds that PAINT an interface, which
// are the same kinds that elect a box.
//
// EMPTY MEANS INHERIT, which is why the default is '' and not the name of a
// theme. A placement that says nothing takes its map's, and a map that says
// nothing takes the world's — so the common case costs no rows at all, and
// the property only ever holds a deliberate answer.

import {RuleBuilder} from '../builders/RuleBuilder';

export const STYLED = {
  rule: 'styled',
  trait: 'hasAStyle',
  theme: 'theme',
} as const;

const rule = new RuleBuilder({
  id: STYLED.rule,
  name: 'Styled',
  ability: 'Has a Style',
});

/**
 * NAMED FOR THE TRAIT, as the box's is, and for the reason written there: a
 * `use trait` row stores `Styled#HasAStyleTrait` and the editor resolves that
 * against this module's EXPORT names. Export it as anything else and every
 * row naming it elects nothing, silently (specs/BOXES_PLAN.md).
 */
export const HasAStyleTrait = rule.addTrait({
  id: STYLED.trait,
  name: 'Has a Style',
});

/**
 * The `.style` file this actor is painted out of — a module path, or empty.
 *
 * A STRING RATHER THAN A CLOSED SET, because an actor's own properties have no
 * enum type and this does not need one: the map editor special-cases this
 * property to offer the project's themes, and a value naming no file falls
 * through to the map's theme rather than drawing nothing.
 */
export const ThemeProperty = HasAStyleTrait.addProperty(
  STYLED.theme,
  'string',
  '',
  {name: 'theme'},
);

export const StyledRule = rule.build();
