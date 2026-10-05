// Short facts about how image models work, shown one at a time while a
// picture is being made. Written for a fifth-grade reader.

interface Fact {
  text: string;
  /** Shown only when the picture being made is of this kind. */
  only?: 'animated' | 'pixel';
}

const FACTS: readonly Fact[] = [
  {
    text: 'The AI did not look up your picture anywhere. It is making a brand new one right now.',
  },
  {
    text: 'The AI learned from millions of pictures with captions. That is how it knows what a "cat" or a "crown" looks like.',
  },
  {
    text: 'The AI starts with a screen of fuzzy static. Step by step, it clears it up until a picture appears.',
  },
  {
    text: 'Every word in your sentence matters. "Sparkly" and "grumpy" send the picture in different directions.',
  },
  {
    text: 'The AI does not know what the thing you asked for really looks like. It makes its best guess from the words.',
  },
  {
    text: 'Ask for the same sentence twice and you can get two different pictures. A hidden number, called a seed, makes each one different.',
  },
  {
    text: 'The AI is bad at writing. If letters show up in a picture, they are often scrambled.',
  },
  {
    text: 'Hands, fingers and feet are hard for the AI. Count them when your picture arrives.',
  },
  {
    text: 'Pixel art is made of big square dots. The AI is asked to draw with those squares on purpose.',
    only: 'pixel',
  },
  {
    text: 'An animated character is several pictures. The AI draws each one from the first, so they match.',
    only: 'animated',
  },
  {
    text: 'Another AI checks every picture first, to make sure it is okay for school.',
  },
  {
    text: 'When the AI draws a cat, it is not a photo of a real cat. It is a mix of what the AI learned.',
  },
];

/** What is being made, so a fact about it can be shown. */
export interface FactContext {
  animated: boolean;
  pixel: boolean;
}

/** One fact that fits, chosen at random; `avoid` keeps a run from
    repeating the last. */
export function pickFact(
  context: FactContext,
  avoid?: string,
  random = Math.random
): string {
  const choices = FACTS.filter(
    fact =>
      fact.text !== avoid &&
      (!fact.only ||
        (fact.only === 'animated' ? context.animated : context.pixel))
  );
  return choices[Math.floor(random() * choices.length)].text;
}
