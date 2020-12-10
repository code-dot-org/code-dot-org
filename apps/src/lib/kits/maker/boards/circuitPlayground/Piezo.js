/** @file Wrapper around Johnny-Five Piezo component to modify play() */
import five from '@code-dot-org/johnny-five';
import '../../../../../utils'; // For Function.prototype.inherits

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
 *        song to be played.  Can be one of:
 *          A 1D array of notes: ['C#4', 'D4', 'E4']
 *            in this case each note is assumed to be a quarter-note.
 *          A 2D array of notes+durations: [['C#4', 1/4], ['D4', 1/4], ['E4', 1/2]]
 *            where a duration of 1.0 is a whole-note in the given tempo.
 * @param {number} [tempo] in beats per minute
 * @override
 */
Piezo.prototype.play = function(notes, tempo = 120) {
  five.Piezo.prototype.play.call(this, {
    song: notes.map(n => {
      if (typeof n === 'string') {
        return [n, 1 / 4];
      }
      return n;
    }),
    tempo
  });
};

Piezo.prototype.playNotes = Piezo.prototype.play;

Piezo.prototype.playSong = Piezo.prototype.play;
/**
 * We override johnny-five's stop() and off() functions so that they do the
 * same thing.
 * The original implementations did the following:
 *   stop() : Cancelled play(), clearing an interval to prevent the current
 *            song from continuting.
 *   off()  : Cancelled frequency() or note(), calling noTone() to stop the
 *            current note from playing.
 * In practice, we expect our students to always want both of these behaviors
 * together (stop the current note AND stop the song) so now that's what both
 * methods do.
 * @override
 */
Piezo.prototype.stop = function() {
  five.Piezo.prototype.stop.call(this);
  five.Piezo.prototype.off.call(this);
};
Piezo.prototype.off = Piezo.prototype.stop;
