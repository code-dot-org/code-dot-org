// "Panel" — a box behind a group.
//
// The one interface actor whose point is what it CARRIES. A dialog is a
// Panel with a title, a field and two buttons on it, and they are its
// children (specs/PARENTING.md): where each sits is measured from the panel,
// so the panel moves, turns and fades as one thing with everything on it, and
// the map editor drags them as a group. The Panel itself is nearly nothing —
// a fill, an edge, and the box a Label already has.
//
// IT ACTS LIKE A LABEL, for the same reason a Button does: the box, its size
// and the words are the Label's, and a dialog's background and its title are
// the same shape of thing. The words start EMPTY, which is what makes it a
// panel rather than a label with a border — but they are there, so a caption
// on the panel is `set text` rather than a second actor.
//
// ITS FACE IS PAINTED HERE, as the Button's is: what a Panel IS gets no
// property, and what this particular panel looks like is a routine a learner
// opens and edits. A darker fill than the Button's, so a button on a panel
// reads as a button on a panel.
//
// WHICH KINDS ACCEPT CHILDREN in the map editor is a question the Panel is
// the first answer to, and is not answered in this file: a parent is a fact
// about the placement (`positional.parent`), set in the inspector on the
// child, and any actor may be one. What a Panel adds is a picture that reads
// as somewhere to put things.

import {labelHalf, labelSizeOf} from './label';
import {BORDER, LOOK, RADIUS} from './look';
import {
  actorFile,
  actsLike,
  corner,
  drawParagraph,
  fill,
  me,
  noOutline,
  outline,
  rectangle,
  setText,
  showAs,
  swatch,
  textOf,
  useStyle,
  words,
} from './workspace';

/** How big a Panel is unless a project says otherwise: room for a form. */
const WIDTH = 240;
const HEIGHT = 160;

const width = () => labelSizeOf('Width');
const height = () => labelSizeOf('Height');

/** `set ⟨width|height⟩ of this actor to ⟨n⟩` — the Label's slot, resized. */
const sized = (name: 'Width' | 'Height', value: number) => ({
  type: `world_set_Boxed_${name}Property`,
  inputs: {
    ACTOR: me(),
    VALUE: {shadow: {type: 'math_number', fields: {NUM: value}}},
  },
});

export const panelActor = actorFile(
  'Panel',
  [
    // FIRST, so everything below overrides it: the size, the empty words,
    // and the face this paints instead of the Label's plain one.
    actsLike('actors/label'),
    showAs('panel'),
    sized('Width', WIDTH),
    sized('Height', HEIGHT),
    // No words, on purpose — the Label it acts like says "Label".
    setText('TextProperty', words('')),
  ],
  {
    drawing: {
      width: width(),
      height: height(),
      commands: [
        // A SHEET, which is what a Panel is: rounded, with an edge quiet
        // enough to read the contents over. It was square with a 2px border —
        // an edge you read before the thing it is around (specs/STYLES_PLAN.md).
        fill(swatch(LOOK.surface)),
        outline(swatch(LOOK.surfaceEdge), BORDER),
        corner(RADIUS),
        useStyle('surface'),
        rectangle(0, 0, width(), height()),
        // The edge belongs to the face, not to the caption.
        noOutline(),
        // THE INK, AS A LITERAL, BEFORE THE CLASS. Every other row in this kit says
        // its own look and then offers to be overruled, and the caption was the one
        // that did not — it went straight to `use style ⟨caption⟩`, which leaves the
        // pen alone when no theme defines one. So in a project with NO theme the
        // caption inherited whatever the FACE had just set, and a Button drew its
        // words in the button colour: invisible (specs/STYLES_PLAN.md).
        fill(swatch(LOOK.ink)),
        useStyle('caption'),
        fill(textOf('TextColorProperty')),
        drawParagraph(labelHalf(width()), labelHalf(height()), width()),
      ],
    },
  },
);
