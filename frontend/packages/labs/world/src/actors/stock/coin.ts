// "Coin" — a thing to pick up.
//
// The first stock actor that is not an interface element, and the first with a
// picture instead of a drawing. Two rows, and each names something the project
// must also hold: an animation, and a trait. Importing brings both
// (`importStockActor`), which is the whole reason this file can be two rows.
//
// NO `show as`. That row exists for interface actors, which all look like
// whatever the instance happens to say and are the same smudge at 24 pixels
// (specs/UI_ACTORS.md). A Coin looks like a coin.
//
// IT DOES NOT SCORE. "Can Be Collected" is the whole of a coin's side of being
// collected: it does not know what a player is, and points are not its
// business. Collection knows nothing about scoring and Scoring knows nothing
// about coins, and the handler that says they are the same event belongs to the
// project — which is exactly where the starter puts it. A Coin that awarded
// itself ten points would decide that for every game that imported one.

import {actorFile, playAnimation, useTrait} from './workspace';

/** The animation this plays, and so the one the import must bring. */
export const COIN_ANIMATION = 'coinSpin';

export const coinActor = actorFile('Coin', [
  playAnimation(COIN_ANIMATION),
  useTrait('Collection#CanBeCollectedTrait'),
]);
