/**
 * Snapshot script: k5-ai-data-2024 → ai-decisions-mobile content bundle.
 *
 * Reads the dashboard course config and emits the static content bundle
 * consumed by the mobile prototype at runtime.  This is a one-shot script;
 * its output is committed to the branch.  Re-run when the upstream course
 * config changes.
 *
 * Output:
 *   frontend/apps/studio/src/modules/ai-decisions-mobile/content/unit1.json
 *   frontend/apps/studio/src/modules/ai-decisions-mobile/content/strings.en.json
 *   frontend/apps/studio/src/modules/ai-decisions-mobile/content/strings.hi.json
 *
 * Run via:
 *   yarn workspace @code-dot-org/studio snapshot:k5-ai-decisions
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// ---------------------------------------------------------------------------
// Path resolution
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Repo root — four levels up from frontend/apps/studio/scripts/ */
const REPO_ROOT = path.resolve(__dirname, '../../../..');
const SCRIPT_JSON = path.join(
  REPO_ROOT,
  'dashboard/config/scripts_json/k5-ai-data-2024.script_json',
);
const I18N_SOURCE = path.join(
  REPO_ROOT,
  'i18n/locales/source/course_content/2024/k5-ai-data-2024.json',
);
const CONTENT_OUT = path.join(
  __dirname,
  '../src/modules/ai-decisions-mobile/content',
);

// ---------------------------------------------------------------------------
// Type aliases matching data-model.md
// ---------------------------------------------------------------------------

// Declared but unused in the snapshot output — kept as documentation
// of the runtime shape exported by the mobile module.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Language = 'en' | 'hi';
type LevelKind =
  | 'multi'
  | 'match'
  | 'reading'
  | 'video'
  | 'oceans-labeling'
  | 'oceans-video'
  | 'dance-intro-video'
  | 'dance-emoji-pick'
  | 'bubble-choice';

type NodeVariant = 'concept' | 'activity' | 'headline' | 'capstone';

// ---------------------------------------------------------------------------
// Curated mappings: level key → kind / variant / titles
// ---------------------------------------------------------------------------

/**
 * Maps each level key in k5-ai-data-2024 to its prototype LevelKind.
 * The prototype simplifies complex desktop interactions (Sprite Lab sorting,
 * Dance Party Blockly) to touch-first equivalents per spec.
 */
const KIND_MAP: Record<string, LevelKind> = {
  sorting_items_wings: 'match',
  sorting_items_prediction: 'multi',
  sorting_items_prediction_2: 'multi',
  sorting_items_by_fill_color: 'match',
  sorting_items_new: 'match',
  k5_ai_matching_sort_data: 'match',
  k5_ai_sorting_choice_level: 'multi',
  Oceans_Video_Elementary_Machine_Learning_2024: 'oceans-video',
  Oceans_FishVTrash_2024: 'oceans-labeling',
  Oceans_CreaturesVTrashDemo_2024: 'oceans-labeling',
  Oceans_CreaturesVTrash_2024: 'oceans-labeling',
  Oceans_Long_2024: 'oceans-labeling',
  k5_ai_pilot_sorting_foods_2024: 'multi',
  k5_ai_pilot_sorting_fruit_vegetables_2024: 'multi',
  sorting_items_emoji: 'multi',
  k5_ai_matching_background_emoji: 'match',
  ai_data_dance_party_video_level: 'dance-intro-video',
  dance_ai_customize_effect_2024: 'dance-emoji-pick',
  k5_ai_data_survey_level: 'multi',
  k5_ai_data_student_data_questions_level: 'reading',
  k5_ai_final_choice_level: 'bubble-choice',
};

/** Variant overrides; defaults to 'activity'. */
const VARIANT_MAP: Record<string, NodeVariant> = {
  Oceans_FishVTrash_2024: 'headline',
  Oceans_CreaturesVTrashDemo_2024: 'headline',
  Oceans_CreaturesVTrash_2024: 'headline',
  Oceans_Long_2024: 'headline',
  k5_ai_final_choice_level: 'capstone',
  Oceans_Video_Elementary_Machine_Learning_2024: 'concept',
  k5_ai_data_student_data_questions_level: 'concept',
  ai_data_dance_party_video_level: 'concept',
};

/** English level title shown on the journey bubble. */
const TITLE_EN: Record<string, string> = {
  sorting_items_wings: 'How is it sorted?',
  sorting_items_prediction: 'Sort it out',
  sorting_items_prediction_2: 'Sorting items',
  sorting_items_by_fill_color: 'Sort by color',
  sorting_items_new: 'Sort new items',
  k5_ai_matching_sort_data: 'How are these sorted?',
  k5_ai_sorting_choice_level: 'Your turn!',
  Oceans_Video_Elementary_Machine_Learning_2024: 'Machine Learning',
  Oceans_FishVTrash_2024: 'Fish or Trash?',
  Oceans_CreaturesVTrashDemo_2024: 'Creatures demo',
  Oceans_CreaturesVTrash_2024: 'Creatures or Trash?',
  Oceans_Long_2024: 'AI Bias',
  k5_ai_pilot_sorting_foods_2024: 'Sort foods',
  k5_ai_pilot_sorting_fruit_vegetables_2024: 'Fruits & Veggies',
  sorting_items_emoji: 'Feature vectors',
  k5_ai_matching_background_emoji: 'Match backgrounds',
  ai_data_dance_party_video_level: 'Dance Party AI',
  dance_ai_customize_effect_2024: 'AI Dance Remix',
  k5_ai_data_survey_level: 'Data survey',
  k5_ai_data_student_data_questions_level: 'Explore the data',
  k5_ai_final_choice_level: 'Share Your Voice',
};

/**
 * Hindi level titles.  Values marked [HI-TODO] require translation by a
 * native Hindi speaker before the India pilot.
 */
const TITLE_HI: Record<string, string> = {
  sorting_items_wings: 'इसे कैसे छाँटा गया है?',
  sorting_items_prediction: 'इसे छाँटें',
  sorting_items_prediction_2: 'वस्तुओं को छाँटना',
  sorting_items_by_fill_color: 'रंग से छाँटें',
  sorting_items_new: 'नई वस्तुओं को छाँटें',
  k5_ai_matching_sort_data: 'ये कैसे छाँटे गए?',
  k5_ai_sorting_choice_level: 'आपकी बारी!',
  Oceans_Video_Elementary_Machine_Learning_2024: 'मशीन लर्निंग',
  Oceans_FishVTrash_2024: 'मछली या कचरा?',
  Oceans_CreaturesVTrashDemo_2024: 'प्राणी प्रदर्शन',
  Oceans_CreaturesVTrash_2024: 'प्राणी या कचरा?',
  Oceans_Long_2024: 'AI पूर्वाग्रह',
  k5_ai_pilot_sorting_foods_2024: 'खाना छाँटें',
  k5_ai_pilot_sorting_fruit_vegetables_2024: 'फल और सब्जियाँ',
  sorting_items_emoji: 'फीचर वेक्टर',
  k5_ai_matching_background_emoji: 'बैकग्राउंड मिलाएँ',
  ai_data_dance_party_video_level: 'डांस पार्टी AI',
  dance_ai_customize_effect_2024: 'AI डांस रीमिक्स',
  k5_ai_data_survey_level: 'डेटा सर्वे',
  k5_ai_data_student_data_questions_level: 'डेटा देखें',
  k5_ai_final_choice_level: 'अपनी आवाज़ साझा करें',
};

/** Design token per lesson section (FR-002b). */
const SECTION_TINT: Record<number, string> = {
  1: 'neutral.sand',
  2: 'blue.light',
  3: 'purple.light',
  4: 'green.light',
  5: 'orange.light',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Derive a stable level id from the level key. */
function levelId(levelKey: string, chapter: number): string {
  // Oceans levels keep their original key (OceansLabeling renderer uses it).
  if (levelKey.startsWith('Oceans_') || levelKey.startsWith('oceans_')) {
    return levelKey.toLowerCase();
  }
  return `ch${chapter}`;
}

/** Strip HTML tags from instruction strings for plain-text i18n values. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Payload builders — one per LevelKind
// ---------------------------------------------------------------------------

/**
 * Builds a MultiPayload from the i18n source for a given lesson/level URL.
 * Falls back to a stub when the source has no contained-level questions.
 */
function buildMultiPayload(
  i18nData: Record<string, unknown>,
  lessonNum: number,
  levelPos: number,
  levelKey: string,
  strings: Record<string, string>,
): object {
  const urlKey = `https://studio.code.org/s/k5-ai-data-2024/lessons/${lessonNum}/levels/${levelPos}`;
  const entry = i18nData[urlKey] as
    | {
        'contained levels'?: Array<{
          dsls: {
            questions: Array<{text: string}>;
            answers: Array<{text: string; correct: boolean; feedback?: string}>;
          };
        }>;
        dsls?: {
          questions: Array<{text: string}>;
          answers: Array<{text: string; correct?: boolean}>;
        };
        sublevels?: Record<
          string,
          {
            dsls: {
              questions: Array<{text: string}>;
              answers: Array<{text: string; correct?: boolean}>;
            };
          }
        >;
      }
    | undefined;

  // Extract from contained levels (lesson 1 and 3 pattern)
  const contained = entry?.['contained levels']?.[0]?.dsls;
  if (contained?.questions?.[0] && contained.answers) {
    const qKey = `${levelKey}.q`;
    strings[qKey] = stripHtml(contained.questions[0].text);
    strings[`${qKey}.hi`] = `[HI-TODO] ${strings[qKey]}`;

    const options = contained.answers.map((a, i) => {
      const optKey = `${levelKey}.opt.${i}`;
      strings[optKey] = stripHtml(a.text);
      strings[`${optKey}.hi`] = `[HI-TODO] ${strings[optKey]}`;
      return {key: optKey, correct: Boolean(a.correct)};
    });
    return {questionKey: qKey, options};
  }

  // Survey pattern (lesson 4): all answers correct
  const sublevels = entry?.sublevels;
  if (sublevels) {
    const firstSub = Object.values(sublevels)[0] as {
      dsls: {questions: Array<{text: string}>; answers: Array<{text: string}>};
    };
    if (firstSub?.dsls?.questions?.[0]) {
      const qKey = `${levelKey}.q`;
      strings[qKey] = stripHtml(firstSub.dsls.questions[0].text);
      strings[`${qKey}.hi`] = `[HI-TODO] ${strings[qKey]}`;
      const options = firstSub.dsls.answers.map((a, i) => {
        const optKey = `${levelKey}.opt.${i}`;
        strings[optKey] = stripHtml(a.text);
        strings[`${optKey}.hi`] = `[HI-TODO] ${strings[optKey]}`;
        return {key: optKey, correct: true};
      });
      return {questionKey: qKey, options};
    }
  }

  // Stub fallback for pure sorting/activity levels
  const qKey = `${levelKey}.q`;
  strings[qKey] = TITLE_EN[levelKey] ?? `Level ${levelPos}`;
  strings[`${qKey}.hi`] = TITLE_HI[levelKey] ?? `[HI-TODO] ${strings[qKey]}`;
  return {
    questionKey: qKey,
    options: [
      {key: `${levelKey}.opt.0`, correct: true},
      {key: `${levelKey}.opt.1`, correct: false},
    ],
  };
}

/** Builds a MatchPayload stub (item list for drag-and-drop). */
function buildMatchPayload(
  levelKey: string,
  strings: Record<string, string>,
): object {
  const baseItems = [
    {key: `${levelKey}.item.0`, targetKey: `${levelKey}.target.0`},
    {key: `${levelKey}.item.1`, targetKey: `${levelKey}.target.1`},
    {key: `${levelKey}.item.2`, targetKey: `${levelKey}.target.2`},
  ];
  baseItems.forEach((_, i) => {
    strings[`${levelKey}.item.${i}`] = `Item ${i + 1}`;
    strings[`${levelKey}.item.${i}.hi`] = `[HI-TODO] आइटम ${i + 1}`;
    strings[`${levelKey}.target.${i}`] = `Category ${i + 1}`;
    strings[`${levelKey}.target.${i}.hi`] = `[HI-TODO] श्रेणी ${i + 1}`;
  });
  return {items: baseItems};
}

/** Builds a ReadingPayload stub. */
function buildReadingPayload(
  levelKey: string,
  strings: Record<string, string>,
): object {
  const pages = [{textKey: `${levelKey}.p1`}, {textKey: `${levelKey}.p2`}];
  strings[`${levelKey}.p1`] =
    'Students collect data to help AI make decisions.';
  strings[`${levelKey}.p1.hi`] =
    'छात्र AI को निर्णय लेने में मदद के लिए डेटा एकत्र करते हैं।';
  strings[`${levelKey}.p2`] =
    'The more data AI has, the better its predictions.';
  strings[`${levelKey}.p2.hi`] =
    'AI के पास जितना अधिक डेटा होगा, उसकी भविष्यवाणी उतनी ही बेहतर होगी।';
  return {pages};
}

/** Builds a VideoPayload (src=null → thumbnail substitution per FR-035). */
function buildVideoPayload(levelKey: string): object {
  return {src: null, thumbnailId: levelKey, durationSec: 120};
}

/**
 * Builds the DancePickPayload.  Uses 6 emoji options covering the
 * demo path; canned remixes are defined in content/dance-remixes/.
 */
function buildDancePickPayload(): object {
  return {
    emojiOptions: ['😄', '🌊', '✨', '🌈', '🔥', '🎵'],
    remixes: {
      '😄🌊✨': {paletteId: 'ocean-glow', audioId: 'loop-calm'},
      '🌈🔥🎵': {paletteId: 'warm-glow', audioId: 'loop-upbeat'},
      '😄🌈🎵': {paletteId: 'rainbow-burst', audioId: 'loop-pop'},
      '🔥✨🎵': {paletteId: 'spark-show', audioId: 'loop-energetic'},
    },
  };
}

/**
 * Builds the BubbleChoicePayload for the lesson-5 capstone.
 * Four tracks: letter, poetry, sprite lab, voice note.
 */
function buildBubbleChoicePayload(strings: Record<string, string>): object {
  const base = 'k5_ai_final_choice_level';

  // Track titles
  strings[`${base}.track.letter`] = 'Write a letter';
  strings[`${base}.track.letter.hi`] = 'पत्र लिखें';
  strings[`${base}.track.poetry`] = 'Write a poem';
  strings[`${base}.track.poetry.hi`] = 'कविता लिखें';
  strings[`${base}.track.sprite`] = 'Make a Sprite Lab project';
  strings[`${base}.track.sprite.hi`] = 'स्प्राइट लैब प्रोजेक्ट बनाएँ';
  strings[`${base}.track.voice`] = 'Record your voice';
  strings[`${base}.track.voice.hi`] = 'अपनी आवाज़ रिकॉर्ड करें';

  // Sub-level stub for each track (reading level with one page)
  const makeSubLevel = (trackId: string): object => ({
    id: `${base}-${trackId}`,
    kind: 'reading',
    variant: 'activity',
    title: {
      en: strings[`${base}.track.${trackId}`],
      hi: strings[`${base}.track.${trackId}.hi`],
    },
    payload: {pages: [{textKey: `${base}.${trackId}.p1`}]},
  });

  strings[`${base}.letter.p1`] =
    'Write a letter to your principal sharing your opinion on AI in school.';
  strings[`${base}.letter.p1.hi`] =
    'अपने प्रधानाचार्य को स्कूल में AI पर अपनी राय साझा करते हुए एक पत्र लिखें।';
  strings[`${base}.poetry.p1`] =
    'Write a poem about what you learned about AI.';
  strings[`${base}.poetry.p1.hi`] =
    'AI के बारे में आपने जो सीखा उस पर एक कविता लिखें।';
  strings[`${base}.sprite.p1`] =
    'Create a Sprite Lab project to share your AI story.';
  strings[`${base}.sprite.p1.hi`] =
    'अपनी AI कहानी साझा करने के लिए एक स्प्राइट लैब प्रोजेक्ट बनाएँ।';
  strings[`${base}.voice.p1`] =
    'Record a short video or audio message about AI.';
  strings[`${base}.voice.p1.hi`] =
    'AI के बारे में एक छोटा वीडियो या ऑडियो संदेश रिकॉर्ड करें।';

  return {
    options: [
      {key: 'letter', subLevels: [makeSubLevel('letter')]},
      {key: 'poetry', subLevels: [makeSubLevel('poetry')]},
      {key: 'sprite', subLevels: [makeSubLevel('sprite')]},
      {key: 'voice', subLevels: [makeSubLevel('voice')]},
    ],
  };
}

// ---------------------------------------------------------------------------
// UI chrome strings (not in the course content i18n files)
// ---------------------------------------------------------------------------

function addChromeStrings(
  en: Record<string, string>,
  hi: Record<string, string>,
): void {
  const pairs: Array<[string, string, string]> = [
    // [key, en value, hi value]
    ['journey.title', 'How AI Makes Decisions', 'AI कैसे फैसले करता है'],
    [
      'journey.section.l1',
      'Lesson 1 — Making Predictions',
      'पाठ 1 — भविष्यवाणी करना',
    ],
    ['journey.section.l2', 'Lesson 2 — Training AI', 'पाठ 2 — AI प्रशिक्षण'],
    [
      'journey.section.l3',
      'Lesson 3 — Using AI Bot',
      'पाठ 3 — AI Bot का उपयोग',
    ],
    [
      'journey.section.l4',
      'Lesson 4 — AI Tools in School',
      'पाठ 4 — स्कूल में AI टूल',
    ],
    [
      'journey.section.l5',
      'Lesson 5 — Share Your Voice',
      'पाठ 5 — अपनी आवाज़ साझा करें',
    ],
    ['journey.next.pulse-aria', 'Next lesson', 'अगला पाठ'],
    ['seat.picker.add', 'Add a journey', 'एक यात्रा जोड़ें'],
    ['seat.picker.clear', 'Clear this seat', 'यह सीट साफ़ करें'],
    [
      'seat.picker.clear.confirm',
      "Clear this journey? This can't be undone.",
      'यह यात्रा साफ़ करें? इसे पूर्ववत नहीं किया जा सकता।',
    ],
    ['lang.pill.en', 'EN', 'EN'],
    ['lang.pill.hi', 'हिं', 'हिं'],
    [
      'tts.unavailable',
      'Voice not available on this device',
      'इस डिवाइस पर आवाज़ उपलब्ध नहीं है',
    ],
    ['celebration.lesson-complete', 'Lesson complete!', 'पाठ पूरा!'],
    [
      'celebration.unit-complete',
      'You finished the whole journey!',
      'आपने पूरी यात्रा पूरी की!',
    ],
    [
      'dance.intro.copy',
      'Pick three emoji. AI Bot will remix.',
      'तीन इमोजी चुनें। AI Bot रीमिक्स करेगा।',
    ],
    ['dance.thinking', 'AI Bot is thinking…', 'AI Bot सोच रहा है…'],
    ['nav.back', 'Back', 'वापस'],
    ['nav.seat-indicator', 'Seat', 'सीट'],
    ['lesson.start', 'Start lesson', 'पाठ शुरू करें'],
    ['lesson.continue', 'Continue', 'जारी रखें'],
    ['lesson.replay', 'Play again', 'फिर से खेलें'],
    ['oceans.demo.aria', 'Sorting demonstration', 'छँटाई प्रदर्शन'],
    ['oceans.sort.fish', 'Fish', 'मछली'],
    ['oceans.sort.trash', 'Trash', 'कचरा'],
    ['match.correct', 'Correct!', 'सही!'],
    ['match.try-again', 'Try again', 'पुनः प्रयास करें'],
    ['multi.correct', 'Correct!', 'सही!'],
    ['multi.try-again', 'Try another answer', 'दूसरा उत्तर आज़माएँ'],
  ];

  for (const [key, enVal, hiVal] of pairs) {
    en[key] = enVal;
    hi[key] = hiVal;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function run(): void {
  console.log('Reading source files…');

  const scriptJson = JSON.parse(fs.readFileSync(SCRIPT_JSON, 'utf-8')) as {
    lessons: Array<{key: string; name: string; relative_position: number}>;
    script_levels: Array<{
      chapter: number;
      position: number;
      level_keys: string[];
      seeding_key: {'lesson.key': string};
    }>;
  };

  const i18nData = JSON.parse(fs.readFileSync(I18N_SOURCE, 'utf-8')) as Record<
    string,
    unknown
  >;

  // Build lesson name → lesson number map
  const lessonNumByKey = new Map<string, number>(
    scriptJson.lessons.map(l => [l.key, l.relative_position]),
  );

  // Group script_levels by lesson (relative_position)
  const levelsByLesson = new Map<number, typeof scriptJson.script_levels>();
  for (const sl of scriptJson.script_levels) {
    const num = lessonNumByKey.get(sl.seeding_key['lesson.key']) ?? 0;
    if (!levelsByLesson.has(num)) levelsByLesson.set(num, []);
    levelsByLesson.get(num)!.push(sl);
  }

  // Sort each lesson's levels by position
  for (const [, levels] of levelsByLesson) {
    levels.sort((a, b) => a.position - b.position);
  }

  // String accumulator — EN and HI build in tandem
  const enStrings: Record<string, string> = {};
  const hiStrings: Record<string, string> = {};

  addChromeStrings(enStrings, hiStrings);

  // Build lessons
  const lessons = scriptJson.lessons.map(lesson => {
    const lessonNum = lesson.relative_position;
    const levelEntries = levelsByLesson.get(lessonNum) ?? [];

    // Per-lesson name strings
    const nameEnKey = `lesson.${lessonNum}.name`;
    enStrings[nameEnKey] = lesson.name;
    hiStrings[nameEnKey] = `[HI-TODO] ${lesson.name}`;

    const levels = levelEntries.map((sl, posIdx) => {
      const levelKey = sl.level_keys[0];
      const kind: LevelKind = KIND_MAP[levelKey] ?? 'multi';
      const variant: NodeVariant = VARIANT_MAP[levelKey] ?? 'activity';
      const id = levelId(levelKey, sl.chapter);
      const levelPos = posIdx + 1;

      // Title strings
      const titleEnKey = `level.${id}.title`;
      enStrings[titleEnKey] = TITLE_EN[levelKey] ?? levelKey;
      hiStrings[titleEnKey] =
        TITLE_HI[levelKey] ?? `[HI-TODO] ${enStrings[titleEnKey]}`;

      // Build payload
      let payload: object;
      switch (kind) {
        case 'multi':
          payload = buildMultiPayload(
            i18nData,
            lessonNum,
            levelPos,
            id,
            enStrings,
          );
          // Mirror HI keys from EN accumulator
          for (const k of Object.keys(enStrings)) {
            if (k.startsWith(`${id}.`) && k.endsWith('.hi')) {
              const base = k.slice(0, -3);
              hiStrings[base] = enStrings[k];
              delete enStrings[k];
            }
          }
          break;

        case 'match':
          payload = buildMatchPayload(id, enStrings);
          // Mirror HI keys
          for (const k of Object.keys(enStrings)) {
            if (k.startsWith(`${id}.`) && k.endsWith('.hi')) {
              const base = k.slice(0, -3);
              hiStrings[base] = enStrings[k];
              delete enStrings[k];
            }
          }
          break;

        case 'reading':
          payload = buildReadingPayload(id, enStrings);
          for (const k of Object.keys(enStrings)) {
            if (k.startsWith(`${id}.`) && k.endsWith('.hi')) {
              const base = k.slice(0, -3);
              hiStrings[base] = enStrings[k];
              delete enStrings[k];
            }
          }
          break;

        case 'oceans-labeling': {
          const validKeys = [
            'Oceans_FishVTrash_2024',
            'Oceans_CreaturesVTrashDemo_2024',
            'Oceans_CreaturesVTrash_2024',
            'Oceans_Long_2024',
          ] as const;
          type OceansKey = (typeof validKeys)[number];
          const lk = validKeys.includes(levelKey as OceansKey)
            ? (levelKey as OceansKey)
            : 'Oceans_FishVTrash_2024';
          payload = {levelKey: lk};
          break;
        }

        case 'oceans-video':
        case 'dance-intro-video':
        case 'video':
          payload = buildVideoPayload(id);
          break;

        case 'dance-emoji-pick':
          payload = buildDancePickPayload();
          break;

        case 'bubble-choice':
          payload = buildBubbleChoicePayload(enStrings);
          // Mirror HI keys for bubble-choice strings
          for (const k of Object.keys(enStrings)) {
            if (
              k.startsWith('k5_ai_final_choice_level.') &&
              k.endsWith('.hi')
            ) {
              const base = k.slice(0, -3);
              hiStrings[base] = enStrings[k];
              delete enStrings[k];
            }
          }
          break;

        default:
          payload = {};
      }

      return {
        id,
        kind,
        variant,
        title: {
          en: enStrings[titleEnKey],
          hi: hiStrings[titleEnKey] ?? `[HI-TODO] ${enStrings[titleEnKey]}`,
        },
        payload,
      };
    });

    return {
      id: lessonNum,
      name: {en: enStrings[nameEnKey], hi: hiStrings[nameEnKey]},
      pathIndex: lessonNum - 1,
      sectionTint: SECTION_TINT[lessonNum] ?? 'neutral.sand',
      levels,
    };
  });

  // Validate: capstone appears exactly once in lesson 5
  const capstoneLevels = lessons
    .flatMap(l => l.levels)
    .filter(lv => lv.variant === 'capstone');
  if (capstoneLevels.length !== 1) {
    throw new Error(
      `Expected exactly 1 capstone level; found ${capstoneLevels.length}`,
    );
  }
  if (capstoneLevels[0] && lessons[4]?.levels.indexOf(capstoneLevels[0]) < 0) {
    throw new Error('Capstone level must be in lesson 5');
  }

  // Validate: all oceans-labeling levels have variant === 'headline'
  const oceansLevels = lessons
    .flatMap(l => l.levels)
    .filter(lv => lv.kind === 'oceans-labeling');
  if (oceansLevels.some(lv => lv.variant !== 'headline')) {
    throw new Error('All oceans-labeling levels must have variant=headline');
  }

  // Validate: HI parity — every EN key must exist in HI
  const missingHi = Object.keys(enStrings).filter(k => !(k in hiStrings));
  if (missingHi.length > 0) {
    console.warn(
      `WARNING: ${missingHi.length} EN strings missing HI translation:`,
      missingHi.slice(0, 10),
    );
  }

  const unit1 = {
    id: 'k5-ai-data-2024',
    name: {
      en: 'How AI Makes Decisions',
      hi: 'AI कैसे फैसले करता है',
    },
    units: [
      {
        id: 1,
        name: {
          en: 'How AI Makes Decisions',
          hi: 'AI कैसे फैसले करता है',
        },
        lessons,
      },
    ],
  };

  // Write outputs
  fs.mkdirSync(CONTENT_OUT, {recursive: true});

  fs.writeFileSync(
    path.join(CONTENT_OUT, 'unit1.json'),
    JSON.stringify(unit1, null, 2),
  );
  console.log(
    `✓ Wrote unit1.json (${lessons.flatMap(l => l.levels).length} levels)`,
  );

  // Ensure all EN keys have HI equivalents before writing
  for (const k of Object.keys(enStrings)) {
    if (!(k in hiStrings)) {
      hiStrings[k] = `[HI-TODO] ${enStrings[k]}`;
    }
  }

  fs.writeFileSync(
    path.join(CONTENT_OUT, 'strings.en.json'),
    JSON.stringify(enStrings, null, 2),
  );
  console.log(
    `✓ Wrote strings.en.json (${Object.keys(enStrings).length} keys)`,
  );

  fs.writeFileSync(
    path.join(CONTENT_OUT, 'strings.hi.json'),
    JSON.stringify(hiStrings, null, 2),
  );
  console.log(
    `✓ Wrote strings.hi.json (${Object.keys(hiStrings).length} keys)`,
  );

  const todoCount = Object.values(hiStrings).filter(v =>
    v.startsWith('[HI-TODO]'),
  ).length;
  if (todoCount > 0) {
    console.log(
      `ℹ  ${todoCount} Hindi strings marked [HI-TODO] — needs native-speaker review before pilot`,
    );
  }

  console.log('Snapshot complete.');
}

run();
