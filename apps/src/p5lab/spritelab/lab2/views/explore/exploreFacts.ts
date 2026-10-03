// Short facts about how image models work, shown one at a time while a
// picture is being made. Written for a fifth-grade reader.

export const EXPLORE_FACTS: readonly string[] = [
  'The AI did not look up your picture anywhere. It is making a brand new one right now.',
  'Image AIs learn from millions of pictures with captions. That is how they know what a "cat" or a "crown" looks like.',
  'The AI starts with a screen full of random noise and clears it up, step by step, until a picture appears.',
  'Every word in your sentence matters. "Sparkly" and "grumpy" send the picture in different directions.',
  'The AI does not know what your creature "really" looks like. It makes its best guess from the words.',
  'Ask for the same sentence twice and you can get two different pictures. A hidden number called a seed changes the roll.',
  'Image AIs are bad at writing. If letters show up in a picture, they are often scrambled.',
  'Hands, fingers and feet are hard for image AIs. Count them when your picture arrives.',
  'Pixel art is made of big square dots. The AI is asked to draw with those squares on purpose.',
  'An animated character is several pictures drawn one after another, all from the first one, so they match.',
  'The picture you get back is checked by another AI first, to make sure it is okay for school.',
  'A picture of a cat the AI makes is not a photo of any real cat. It is a mix of what it learned.',
];

/** One fact, chosen at random; `avoid` keeps a run from repeating the last. */
export function pickFact(avoid?: string, random = Math.random): string {
  const choices = EXPLORE_FACTS.filter(fact => fact !== avoid);
  return choices[Math.floor(random() * choices.length)];
}
