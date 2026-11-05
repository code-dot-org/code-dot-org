import FlappyImage from '@/config/brand/assets/catalog/flappy.webp';
import FrozenImage from '@/config/brand/assets/catalog/frozen.webp';
import HelloWorldImage from '@/config/brand/assets/catalog/hello-world-animals-2021.webp';
import HeroImage from '@/config/brand/assets/catalog/hero.webp';
import MinecraftImage from '@/config/brand/assets/catalog/mc.webp';
import OceansImage from '@/config/brand/assets/catalog/oceans.webp';
import PoetryImage from '@/config/brand/assets/catalog/poetry-2023.webp';
import PreExpressImage from '@/config/brand/assets/catalog/pre-express-2025.webp';
import StarWarsImage from '@/config/brand/assets/catalog/starwarsblocks.webp';
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
// ages follow the "Amazon Fire Kids Screen" design in Figma; images are the
// course offerings' images behind studio.code.org/catalog
// (dashboard/config/course_offerings), bundled as WebP at quality 80 so the
// launcher shows them at once and offline. Sprite Lab, a free-play lab, has no
// catalog entry and uses the icon studio.code.org's header shows. The list is
// bundled, so changing it requires a new app build and Amazon review.
export const CURRICULA: readonly Curriculum[] = [
  {
    id: 'pre-express-2025',
    title: 'Pre-Reader Express Course',
    image: {
      src: PreExpressImage,
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
      src: OceansImage,
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
      src: HelloWorldImage,
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
      src: StarWarsImage,
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
      src: FrozenImage,
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
      src: PoetryImage,
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
      src: MinecraftImage,
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
      src: HeroImage,
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
      src: FlappyImage,
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
 * asks the app's page script (workaround_resume.js) to move on to the first
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
