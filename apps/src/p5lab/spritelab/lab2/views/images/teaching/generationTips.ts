// Short tips about how image-making AI works, shown one at a time over the
// frame while a picture is being made. Written for a fifth-grade reader.

export const GENERATION_TIPS: readonly string[] = [
  'You can learn by seeing, feeling, and holding things. Image-making AI learns from pictures and words.',
  'People help choose which pictures AI learns from.',
  'If AI learns mostly from pictures of red apples, it may make fewer green ones.',
  'A longer prompt does not always lead to a better picture.',
  'When a prompt leaves out details, AI fills them in using patterns it learned.',
  'AI can make a scared-looking character without feeling afraid.',
  'AI can make a happy-looking face without feeling happy.',
  'A picture can look real even when it shows something that never happened.',
  'AI can miss small details or make mistakes, like giving an animal too many legs.',
  'AI can mix up positions, like putting a crown on top of a hat.',
  'A picture can look great and still miss something you asked for.',
  'People can spot mistakes in AI pictures.',
  "AI can combine ideas that don't exist together, like a castle made of clouds.",
  "A surprising picture isn't always a mistake. It might even work better for you.",
  "AI can add details you didn't ask for. Some might become your favorite part.",
];

/** One tip at random; `avoid` keeps a run from showing the same one twice. */
export function pickTip(avoid?: string | null, random = Math.random): string {
  const choices = GENERATION_TIPS.filter(tip => tip !== avoid);
  return choices[Math.floor(random() * choices.length)];
}
