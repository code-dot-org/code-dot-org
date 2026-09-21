// "Danger" — Modern, with a red button.
//
// THE POINT OF THIS FILE IS ITS SIZE. It is four lines of content, and it is
// the whole answer to "how do I make THIS button the dangerous one" — a
// question the first cut of this plan could not answer at all, because a
// drawing named one style and every Button in the project drew the same
// (specs/STYLES_PLAN.md).
//
// A placement points at this file in the map editor. Nothing about the
// Button's kind, its drawing or its handlers changes, and `any ⟨Button⟩`
// still finds it — which is what the whole plan exists to protect.
//
// AND IT IS WHY A FILE MAY EXTEND ONE. Without `extends`, a theme holding one
// class would leave every other class undefined, and an undefined class
// leaves the pen alone — so the caption, the ring and everything else would
// draw in whatever came before. The alternative is a full copy of Modern,
// which drifts the moment Modern changes.

export const dangerStyle = JSON.stringify(
  {
    name: 'Danger',
    extends: 'styles/modern',
    // Tokens merge too, so this could equally have been written as one
    // token — `{"tokens": {"accent": "#b0303a"}}` — which would have turned
    // the Slider and the chosen rows red along with the Button. Said as a
    // CLASS instead, because "the dangerous button" is a statement about
    // buttons and not about the palette.
    styles: {
      button: {fill: '$danger'},
      pressed: {fill: '#8e2630'},
    },
  },
  undefined,
  2,
);
