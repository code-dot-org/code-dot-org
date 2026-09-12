import {generateText} from '@cdo/apps/aiGateway';
import {LevelContext} from '@cdo/apps/levelbuilder/curriculum-generator/ai/context';
import {PROMPT_TAGS} from '@cdo/apps/levelbuilder/curriculum-generator/ai/shared';
import {generateAichatLevel} from '@cdo/apps/levelbuilder/lesson-generator/ai/aichat';
import {generateAilabLevel} from '@cdo/apps/levelbuilder/lesson-generator/ai/ailab';
import {
  generateMatchLevel,
  generateMultiLevel,
} from '@cdo/apps/levelbuilder/lesson-generator/ai/assessments';
import {generateBubbleChoiceLevel} from '@cdo/apps/levelbuilder/lesson-generator/ai/bubbleChoice';
import {generateCodebridgeExemplar} from '@cdo/apps/levelbuilder/lesson-generator/ai/codebridge';
import {generateFreeResponseLevel} from '@cdo/apps/levelbuilder/lesson-generator/ai/freeResponse';
import {parsePlanningDoc} from '@cdo/apps/levelbuilder/lesson-generator/ai/importPlan';
import {generateLessonOutline} from '@cdo/apps/levelbuilder/lesson-generator/ai/outline';
import {generatePanelsForLevel} from '@cdo/apps/levelbuilder/lesson-generator/ai/panels';
import {generatePythonlabLevel} from '@cdo/apps/levelbuilder/lesson-generator/ai/pythonlab';
import {generateSketchlabLevel} from '@cdo/apps/levelbuilder/lesson-generator/ai/sketchlab';
import {
  generateWeblab2Level,
  generateWeblab2Template,
  generateWeblab2TemplateBackedLevel,
} from '@cdo/apps/levelbuilder/lesson-generator/ai/weblab2';
import {generateSlide} from '@cdo/apps/levelbuilder/lesson-slides-generator/ai/slide';
import {generateSlidesOutline} from '@cdo/apps/levelbuilder/lesson-slides-generator/ai/slidesOutline';

jest.mock('@cdo/apps/aiGateway', () => ({generateText: jest.fn()}));
// The real catalogue lives in another package; pinning it here keeps that
// package's changes out of these snapshots.
jest.mock('@cdo/apps/levelbuilder/lesson-generator/ai/ailab/datasets', () => ({
  AILAB_DATASETS: [
    {id: 'dataset-a', name: 'Dataset A'},
    {id: 'dataset-b', name: 'Dataset B'},
  ],
}));

// Every optional field is set so every prompt section renders.
const full: LevelContext = {
  unitName: 'UNIT NAME',
  unitOutline: 'UNIT OUTLINE',
  draftingRules: 'DRAFTING RULES',
  authoringRules: 'AUTHORING RULES',
  lessonName: 'LESSON NAME',
  lessonOutline: 'LESSON OUTLINE',
  targetProject: 'TARGET PROJECT',
  levelName: 'LEVEL NAME',
  levelDescription: 'LEVEL DESCRIPTION',
  suppliedCode: 'SUPPLIED CODE',
  precedingLevels: 'PRECEDING LEVELS',
};
// Only the required fields, so every section is absent.
const minimal: LevelContext = {
  lessonName: 'LESSON NAME',
  levelName: 'LEVEL NAME',
  levelDescription: 'LEVEL DESCRIPTION',
};
const files = [{name: 'index.html', contents: '<h1>hi</h1>'}];
const members = [
  {name: 'm-a', description: 'MEMBER A', suppliedCode: 'MEMBER A CODE'},
  {name: 'm-b', description: 'MEMBER B'},
];

// The first prompt each generator sends is the one that carries the shared
// sections; capturing it and stopping there keeps the run offline.
const CAPTURED = new Error('prompt captured');
const generators = (
  ctx: LevelContext
): Record<string, () => Promise<unknown>> => ({
  aichat: () => generateAichatLevel(ctx, 'explore'),
  ailab: () => generateAilabLevel(ctx),
  multi: () => generateMultiLevel(ctx),
  match: () => generateMatchLevel(ctx),
  bubbleChoice: () =>
    generateBubbleChoiceLevel({
      ...ctx,
      parentLevelName: 'PARENT NAME',
      parentDescription: 'PARENT DESCRIPTION',
      members,
    }),
  codebridgeExemplar: () =>
    generateCodebridgeExemplar(ctx, files, {
      labLabel: 'Web Lab 2',
      constraints: ['CONSTRAINT'],
      promptTag: PROMPT_TAGS.WEBLAB2_PLAN,
    }),
  freeResponse: () => generateFreeResponseLevel(ctx),
  importPlan: () => parsePlanningDoc('LESSON NAME', 'DOCUMENT TEXT'),
  lessonOutline: () => generateLessonOutline(ctx),
  panels: () => generatePanelsForLevel(ctx),
  pythonlab: () => generatePythonlabLevel(ctx),
  sketchlab: () => generateSketchlabLevel(ctx),
  weblab2: () => generateWeblab2Level(ctx),
  weblab2Template: () => {
    // The template pass takes a lesson-scoped context; drop the level fields.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {levelName, levelDescription, precedingLevels, ...lessonCtx} = ctx;
    return generateWeblab2Template({
      ...lessonCtx,
      templateName: 'TEMPLATE NAME',
      members,
    });
  },
  weblab2TemplateBacked: () => generateWeblab2TemplateBackedLevel(ctx, files),
  slidesOutline: () =>
    generateSlidesOutline({
      ...ctx,
      slidesOutline: 'SLIDES OUTLINE',
      levelContents: 'LEVEL CONTENTS',
    }),
  slide: () =>
    generateSlide({
      ...ctx,
      slidesOutline: 'SLIDES OUTLINE',
      levelContents: 'LEVEL CONTENTS',
      precedingSlides: 'PRECEDING SLIDES',
      slideDescription: 'SLIDE DESCRIPTION',
      slideIndex: 0,
    }),
});

const silenceLogs = () => {
  beforeAll(() => {
    jest.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    (generateText as jest.Mock).mockRejectedValue(CAPTURED);
  });
  afterAll(() => jest.restoreAllMocks());
};

const firstPrompt = () =>
  (generateText as jest.Mock).mock.calls[0][0].prompt as string;

describe('generator prompts', () => {
  silenceLogs();
  for (const [name, run] of Object.entries(generators(full))) {
    it(`${name} assembles the same prompt`, async () => {
      await expect(run()).rejects.toBe(CAPTURED);
      expect(firstPrompt()).toMatchSnapshot();
    });
  }
});

describe('generator prompts with every section absent', () => {
  silenceLogs();
  for (const [name, run] of Object.entries(generators(minimal))) {
    it(`${name} assembles the same prompt`, async () => {
      await expect(run()).rejects.toBe(CAPTURED);
      expect(firstPrompt()).toMatchSnapshot();
    });
  }
});
