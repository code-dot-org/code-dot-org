import SpriteLabIcon from '@/config/brand/assets/courses/sprite-lab-icon.webp';

/** One hosted curriculum, shown as a card in the style of the course catalog. */
export interface Curriculum {
  id: string;
  title: string;
  description: string;
  /** "cover" fills the image strip with a catalog image; "contain" centers an icon. */
  image: {src: string; fit: 'cover' | 'contain'};
  /** Catalog topic labels, in the catalog's order. */
  topics: string[];
  /** A grade ("5") or range ("3-12"), as the catalog shows it. */
  grades: string;
  /** The catalog's duration; free-play labs have none. */
  duration?: 'Lesson' | 'Week' | 'Month' | 'Quarter';
  /**
   * Hosted page the app navigates to. Its host must be listed in
   * server.allowNavigation in capacitor.config.ts.
   */
  url: string;
}

const STUDIO = 'https://studio.code.org';

// The Amazon Fire Kids Content Library, in its order. Titles, descriptions,
// images, topics and grades come from the course offerings behind
// studio.code.org/catalog (dashboard/config/course_offerings); durations from
// the catalog cards. Sprite Lab, a free-play lab, has no catalog entry and
// uses the icon studio.code.org's header shows. The list is bundled, so
// changing it requires a new app build and Amazon review.
export const CURRICULA: readonly Curriculum[] = [
  {
    id: 'pre-express-2025',
    title: 'CS Fundamentals: Pre-reader Express',
    description:
      'Let your pre-reader students learn computer science at their own pace! Learn to create computer programs, solve problems, and work through fun challenges.',
    image: {
      src: 'https://images.code.org/cbb2fee0082642565bca8e3d917b1284-pre-express.png',
      fit: 'cover',
    },
    topics: ['Programming'],
    grades: 'K-3',
    duration: 'Month',
    url: `${STUDIO}/courses/pre-express-2025/units/1`,
  },
  {
    id: 'oceans',
    title: 'AI for Oceans',
    description:
      'In this fun introduction to artificial intelligence, you train a real machine learning model to identify sea creatures and trash in the ocean.',
    image: {
      src: 'https://images.code.org/58cc5271d85e017cf5030ea510ae2715-AI for Oceans.png',
      fit: 'cover',
    },
    topics: ['Artificial Intelligence', 'Data'],
    grades: '3-12',
    duration: 'Lesson',
    url: `${STUDIO}/courses/oceans/units/1`,
  },
  {
    id: 'hello-world-animals-2021',
    title: 'Hello World: Animals',
    description:
      'Lions and tigers and bears, oh my! In this animal-themed intro to Sprite Lab, students learn computer science basics by building fun, interactive projects.',
    image: {
      src: 'https://images.code.org/c0bfe595fb60a8595467a06486c65d33-Hello World Animals Theme.png',
      fit: 'cover',
    },
    topics: ['Games and Animations', 'Art and Design', 'Programming'],
    grades: '2-12',
    duration: 'Lesson',
    url: `${STUDIO}/courses/hello-world-animals-2021/units/1`,
  },
  {
    id: 'starwarsblocks',
    title: 'Star Wars: Building a Galaxy With Code (Blockly)',
    description:
      'Use block coding to learn to program droids, and create your own Star Wars game in a galaxy far, far away.',
    image: {
      src: 'https://images.code.org/fad4498cf3df9984efe995a92e5538d8-StarWars2.png',
      fit: 'cover',
    },
    topics: ['Games and Animations', 'Programming'],
    grades: '2-12',
    duration: 'Lesson',
    url: `${STUDIO}/courses/starwarsblocks/units/1`,
  },
  {
    id: 'frozen',
    title: 'Code with Anna and Elsa',
    description:
      'Join Anna and Elsa as they explore the magic and beauty of ice with code! Create snowflakes and patterns as you ice-skate and make a winter wonderland.',
    image: {
      src: 'https://images.code.org/f88534ee3652b3c55610069622d36b76-Frozen Tutorial.png',
      fit: 'cover',
    },
    topics: ['Art and Design', 'Programming'],
    grades: '1-4',
    duration: 'Lesson',
    url: `${STUDIO}/courses/frozen/units/1/lessons/1/levels/1`,
  },
  {
    id: 'poetry-2023',
    title: 'Coding with Poetry',
    description:
      'Explore the intersection of coding and language arts by creating interactive poems, illustrating the mood and tone with code.',
    image: {
      src: 'https://images.code.org/803a9b24caf309116f8f9652d9a3e135-Coding with Poetry.png',
      fit: 'cover',
    },
    topics: [
      'English Language Arts',
      'Games and Animations',
      'Art and Design',
      'Programming',
    ],
    grades: '3-8',
    duration: 'Lesson',
    url: `${STUDIO}/courses/poetry-2023/units/1`,
  },
  {
    id: 'mc',
    title: 'Minecraft Adventurer',
    description:
      'Learn the basics of computer science by programming Alex or Steve to move through a simulated piece of a Minecraft world.',
    image: {
      src: 'https://images.code.org/394e2f88d57df1306f95903e709a4fbf-MC HOC.png',
      fit: 'cover',
    },
    topics: ['Games and Animations', 'Programming'],
    grades: '2-12',
    duration: 'Lesson',
    url: `${STUDIO}/courses/mc/units/1`,
  },
  {
    id: 'hero',
    title: "Minecraft: Hero's Journey",
    description:
      'Build and explore with Minecraft! Players write code that instructs the Agent to execute their commands and overcome in-game obstacles.',
    image: {
      src: 'https://images.code.org/bc18ee38884e2fcf640315516932ad20-Heros Journey.png',
      fit: 'cover',
    },
    topics: ['Games and Animations', 'Programming'],
    grades: '2-12',
    duration: 'Lesson',
    url: `${STUDIO}/courses/hero/units/1/lessons/1/levels/1`,
  },
  {
    id: 'flappy',
    title: 'Flappy Code',
    description:
      'Create a game using basic block code in this introductory computer science activity.',
    image: {
      src: 'https://images.code.org/25430e22ea0dcc7086ce618600498df5-flappy.png',
      fit: 'cover',
    },
    topics: ['Games and Animations', 'Programming'],
    grades: '2-12',
    duration: 'Lesson',
    url: `${STUDIO}/flappy/1`,
  },
  {
    id: 'spritelab',
    title: 'Sprite Lab',
    description: 'Create your own characters, stories and games with code.',
    image: {src: SpriteLabIcon, fit: 'contain'},
    topics: ['Games and Animations', 'Art and Design', 'Programming'],
    grades: '2-12',
    url: `${STUDIO}/projects/spritelab`,
  },
];

/**
 * The curriculum whose course or unit is `name`, the name certificate pages
 * carry. Undefined when no curriculum, or more than one, belongs to it.
 */
export function curriculumForCourse(
  name: string,
  curricula: readonly Curriculum[] = CURRICULA,
): Curriculum | undefined {
  const matches = curricula.filter(curriculum => courseOf(curriculum) === name);
  return matches.length === 1 ? matches[0] : undefined;
}

// The segment after /courses/ or /s/, or the first, as in /flappy/1.
// Free-play projects have no end and so no course.
function courseOf(curriculum: Curriculum) {
  const [first, second] = new URL(curriculum.url).pathname
    .split('/')
    .filter(Boolean);
  if (first === 'courses' || first === 's') {
    return second;
  }
  return first === 'projects' ? undefined : first;
}

/**
 * The curriculum's first level. Curricula that open on a unit overview start
 * at its first lesson's first level; the others already open on a level.
 */
export function firstLevelUrl(curriculum: Curriculum): string {
  const url = new URL(curriculum.url);
  if (/^\/courses\/[^/]+\/units\/\d+\/?$/.test(url.pathname)) {
    url.pathname = url.pathname.replace(/\/?$/, '/lessons/1/levels/1');
  }
  return url.toString();
}
