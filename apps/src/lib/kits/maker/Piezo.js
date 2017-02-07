/** @file Wrapper around Johnny-Five Piezo component to modify play() */
import five from 'johnny-five';
import '../../../utils'; // For Function.prototype.inherits

/**
 * Wrap Johnny-Five's Piezo (buzzer/speaker) component to modify the arguments
 * to its play() function.
 * @param args - see five.Piezo
 * @constructor
 * @extends {five.Piezo}
 */
export default function Piezo(...args) {
  five.Piezo.call(this, ...args);
}
Piezo.inherits(five.Piezo);

/**
 * Here we override johnny-five's Piezo play() function to make it accept
 * different arguments and provide different defaults.
 * @see http://johnny-five.io/api/piezo/#usage
 * @param {Array.<string>|Array.<Array.<string, number>>} notes that make up the
 *        song to be played.
 * @param {number} tempo in beats per minute
 * @override
 */
Piezo.prototype.play = function (notes, tempo) {
  five.Piezo.prototype.play.call(this, {
    song: notes,
    tempo
  });
};
