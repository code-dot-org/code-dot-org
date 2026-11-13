import {
  chooseKeyColor,
  KEY_COLORS,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/keyColor';
import {
  promptText,
  sentenceFor,
} from '@cdo/apps/p5lab/spritelab/lab2/views/sentence/sentences';

describe('SpriteLab2 chooseKeyColor', () => {
  it('defaults to magenta', () => {
    expect(chooseKeyColor('a brick monster')).toBe(KEY_COLORS.magenta);
    expect(chooseKeyColor('')).toBe(KEY_COLORS.magenta);
  });

  it('keys on green for a pink or purple character', () => {
    expect(chooseKeyColor('a pink unicorn')).toBe(KEY_COLORS.green);
    expect(chooseKeyColor('a Purple Princess')).toBe(KEY_COLORS.green);
  });

  it('keeps magenta for a green character', () => {
    expect(chooseKeyColor('a frog')).toBe(KEY_COLORS.magenta);
    expect(chooseKeyColor('a green knight')).toBe(KEY_COLORS.magenta);
  });

  it('picks whichever colour the prompt mentions less', () => {
    expect(chooseKeyColor('a pink frog with a green hat')).toBe(
      KEY_COLORS.magenta
    );
    expect(chooseKeyColor('a purple and pink dragon')).toBe(KEY_COLORS.green);
  });

  // The cached witches are green-skinned on magenta, whatever the words say.
  it('keys every witch on magenta, pink and purple included', () => {
    const sentence = sentenceFor('sprite');
    const adjectives = [undefined, ...sentence.slots.adjective.words];
    const clothing = [undefined, ...sentence.slots.clothing.words];
    for (const adjective of adjectives) {
      for (const worn of clothing) {
        const choices = {
          creature: 'witch',
          adjective: adjective?.id,
          clothing: worn?.id,
        };
        for (const text of [
          promptText(sentence, choices),
          promptText(sentence, choices, {useModelFacingTextVariant: true}),
        ]) {
          expect([text, chooseKeyColor(text)]).toEqual([
            text,
            KEY_COLORS.magenta,
          ]);
        }
      }
    }
  });
});
