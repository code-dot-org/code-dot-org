import SpriteLabIcon from '@/config/brand/assets/courses/sprite-lab-icon.webp';

/** One hosted curriculum, shown as a card on the launcher. */
export interface Curriculum {
  id: string;
  title: string;
  /** "cover" fills the image strip with a catalog image; "contain" centers an icon. */
  image: {src: string; fit: 'cover' | 'contain'};
  /** The kind of activity, shown as the card's tag. */
  category: 'Courses' | 'Hour of AI' | 'Hour of Code' | 'Free Play';
  /** An age range, such as "7-11". */
  ages: string;
  /**
   * Hosted page the app navigates to. Its host must be listed in
   * server.allowNavigation in capacitor.config.ts.
   */
  url: string;
}

const STUDIO = 'https://studio.code.org';

// The Amazon Fire Kids Content Library, in its order. Titles, categories and
// ages follow the "Amazon Fire Kids Screen" design in Figma; images come from
// the course offerings behind studio.code.org/catalog
// (dashboard/config/course_offerings). Sprite Lab, a free-play lab, has no
// catalog entry and uses the icon studio.code.org's header shows. The list is
// bundled, so changing it requires a new app build and Amazon review.
export const CURRICULA: readonly Curriculum[] = [
  {
    id: 'pre-express-2025',
    title: 'Pre-Reader Express Course',
    image: {
      src: 'https://images.code.org/cbb2fee0082642565bca8e3d917b1284-pre-express.png',
      fit: 'cover',
    },
    category: 'Courses',
    ages: '4-7',
    url: `${STUDIO}/courses/pre-express-2025/units/1`,
  },
  {
    id: 'oceans',
    title: 'AI for Oceans',
    image: {
      src: 'https://images.code.org/58cc5271d85e017cf5030ea510ae2715-AI for Oceans.png',
      fit: 'cover',
    },
    category: 'Hour of AI',
    ages: '7-11',
    url: `${STUDIO}/courses/oceans/units/1`,
  },
  {
    id: 'hello-world-animals-2021',
    title: 'Hello World',
    image: {
      src: 'https://images.code.org/c0bfe595fb60a8595467a06486c65d33-Hello World Animals Theme.png',
      fit: 'cover',
    },
    category: 'Hour of Code',
    ages: '7-11',
    url: `${STUDIO}/courses/hello-world-animals-2021/units/1`,
  },
  {
    id: 'starwarsblocks',
    title: 'Star Wars: Building a Galaxy with Code',
    image: {
      src: 'https://images.code.org/fad4498cf3df9984efe995a92e5538d8-StarWars2.png',
      fit: 'cover',
    },
    category: 'Hour of Code',
    ages: '7-11',
    url: `${STUDIO}/courses/starwarsblocks/units/1`,
  },
  {
    id: 'frozen',
    title: 'Code with Anna and Elsa',
    image: {
      src: 'https://images.code.org/f88534ee3652b3c55610069622d36b76-Frozen Tutorial.png',
      fit: 'cover',
    },
    category: 'Hour of Code',
    ages: '7-11',
    url: `${STUDIO}/courses/frozen/units/1/lessons/1/levels/1`,
  },
  {
    id: 'poetry-2023',
    title: 'Coding with Poetry',
    image: {
      src: 'https://images.code.org/803a9b24caf309116f8f9652d9a3e135-Coding with Poetry.png',
      fit: 'cover',
    },
    category: 'Hour of Code',
    ages: '8-14',
    url: `${STUDIO}/courses/poetry-2023/units/1`,
  },
  {
    id: 'mc',
    title: 'Minecraft Adventurer',
    image: {
      src: 'https://images.code.org/394e2f88d57df1306f95903e709a4fbf-MC HOC.png',
      fit: 'cover',
    },
    category: 'Hour of Code',
    ages: '7-14',
    url: `${STUDIO}/courses/mc/units/1`,
  },
  {
    id: 'hero',
    title: "Minecraft's Hero Journey",
    image: {
      src: 'https://images.code.org/bc18ee38884e2fcf640315516932ad20-Heros Journey.png',
      fit: 'cover',
    },
    category: 'Hour of Code',
    ages: '7-14',
    url: `${STUDIO}/courses/hero/units/1/lessons/1/levels/1`,
  },
  {
    id: 'flappy',
    title: 'Flappy Bird Code',
    image: {
      src: 'https://images.code.org/25430e22ea0dcc7086ce618600498df5-flappy.png',
      fit: 'cover',
    },
    category: 'Hour of Code',
    ages: '7-14',
    url: `${STUDIO}/flappy/1`,
  },
  {
    id: 'spritelab',
    title: 'Sprite Lab',
    image: {src: SpriteLabIcon, fit: 'contain'},
    category: 'Free Play',
    ages: '7-14',
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

/**
 * The course, the name signed-out progress is kept under: the segment after
 * /courses/ or /s/, or the first, as in /flappy/1. Free-play projects have no
 * end and so no course.
 */
export function courseOf(curriculum: Curriculum): string | undefined {
  const [first, second] = new URL(curriculum.url).pathname
    .split('/')
    .filter(Boolean);
  if (first === 'courses' || first === 's') {
    return second;
  }
  return first === 'projects' ? undefined : first;
}

/**
 * Where the landing page opens the curriculum. One that starts on a level
 * asks the app's page script (hide_site_chrome.js) to move on to the first
 * level not yet passed; one that starts on its unit overview shows progress
 * there, and a free-play lab reopens its project.
 */
export function launchUrl(curriculum: Curriculum): string {
  const url = new URL(curriculum.url);
  if (/\/levels\/\d+\/?$|^\/[^/]+\/\d+\/?$/.test(url.pathname)) {
    url.searchParams.set('codeai_resume', '1');
  }
  return url.toString();
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
