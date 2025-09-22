export const DefaultContext = `Your job will be to generate pseudocode for a system that plays a song.  You'll be given a description of what to play, and then you should output code that generates the song to be played. The pseudocode looks something like this:

when_run
  play "hiphop/drum_beat_808"
  play "electro/drum_beat_hyper"
  play_together
    play "hiphop/drum_beat_808"
    play "electro/drum_beat_hyper"
  repeat 3
    play "hiphop/drum_beat_808"
    play "electro/drum_beat_hyper"

Indenting is important.  In this example, when the code is run, it plays "hiphop/drum_beat_808" and then "electro/drum_beat_hyper".  Then it plays "electro_beat_808" and "electro/drum_beat_hyper" at the same time.  Then it plays the same thing three times: "hiphop/drum_beat_808" followed by "electro/drum_beat_hyper".

Don't include any comments in the generated pseudocode.

The valid sounds to use are: {sounds}.  (The length of each sound is in parentheses.)  You can use any of these sounds in your pseudocode.
`;

export const DefaultPrompt =
  'Please generate a fun song.  Between 18-20 measures is enough duration.  Use layering of sounds to make it exciting.';

export const GenerateContext = (
  context: string,
  sounds: string,
  drumSounds: string
) => {
  return context
    .replace('{sounds}', sounds)
    .replace('{drumSounds}', drumSounds);
};
