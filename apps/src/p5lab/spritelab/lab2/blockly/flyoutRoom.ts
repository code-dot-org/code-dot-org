// Room kept above the toolbox's flyout, for a control floating over the
// pane's top-left (the ?editors=float trial). Blockly places the flyout by
// an attribute transform and reads it back for every drop, so the room
// goes through its own positioning step: a CSS offset moved the picture
// and left dropped blocks landing where the picture had been. The step is
// wrapped on the base class at load, so it holds for every flyout the
// toolbox builds, whenever it builds it.

import * as BlocklyCore from 'blockly/core';

type Positioned = {
  positionAt_: (width: number, height: number, x: number, y: number) => void;
};

let room = 0;

const proto = BlocklyCore.Flyout.prototype as unknown as Positioned;
const placeAtTop = proto.positionAt_;
proto.positionAt_ = function (this: unknown, width, height, x, y) {
  placeAtTop.call(this, width, height - room, x, y + room);
};

/** Set the room, in pixels; 0 restores the flyout to the top. */
export function setFlyoutRoom(px: number): void {
  room = px;
}
