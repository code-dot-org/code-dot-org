#!/usr/bin/env node
/**
 * generate-mobile-content.mjs — build the mobile content bundle FROM
 * the authoritative dashboard files.
 *
 *   Source of truth (read-only):
 *     dashboard/config/scripts_json/k5-ai-data-2024.script_json
 *     dashboard/config/levels/custom/**\/<level>.level
 *     dashboard/config/scripts/<contained>.multi
 *     dashboard/config/scripts/<contained>.match
 *     dashboard/config/scripts/<contained>.bubble_choice
 *
 *   Outputs (auto-generated, do not hand-edit):
 *     frontend/apps/studio/src/modules/ai-decisions-mobile/content/unit1.json
 *     frontend/apps/studio/src/modules/ai-decisions-mobile/content/strings.en.json
 *
 * Run: `node scripts/generate-mobile-content.mjs` from the studio
 * workspace root.  Re-run after any change to the dashboard content.
 *
 * The dashboard `.level` files are XML-wrapped JSON; the `.multi`,
 * `.match`, and `.bubble_choice` files are a Ruby DSL.  This script
 * parses each format and produces a mobile-shape JSON in one pass.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../..');
const DASHBOARD = path.join(REPO_ROOT, 'dashboard', 'config');
const OUT_DIR = path.join(
  __dirname,
  '../src/modules/ai-decisions-mobile/content',
);

const STAMP =
  '// AUTO-GENERATED FROM dashboard/config — run scripts/generate-mobile-content.mjs to refresh.';

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

/** Parse a .level file — XML <GamelabJr>/<StandaloneVideo>/etc. wrapping <config>JSON</config>. */
function parseLevelFile(p) {
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf8');
  const m = raw.match(/<config><!\[CDATA\[([\s\S]*?)\]\]><\/config>/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch (e) {
    console.warn('Failed to parse level config:', p, e.message);
    return null;
  }
}

/** Parse a .multi DSL into {question, options:[{text, correct, feedback}]}. */
function parseMulti(p) {
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf8');
  const out = {options: []};
  const lines = raw.split('\n');
  for (const line of lines) {
    let m;
    if ((m = line.match(/^question\s+['"](.+?)['"]\s*$/))) {
      out.question = m[1];
    } else if (
      (m = line.match(
        /^(right|wrong)\s+['"]([\s\S]+?)['"]\s*,\s*feedback:\s*['"]([\s\S]+?)['"]\s*$/,
      ))
    ) {
      out.options.push({text: m[2], correct: m[1] === 'right', feedback: m[3]});
    } else if ((m = line.match(/^(right|wrong)\s+['"](.+?)['"]\s*$/))) {
      out.options.push({text: m[2], correct: m[1] === 'right'});
    } else if ((m = line.match(/^name\s+['"](.+?)['"]\s*$/))) {
      out.name = m[1];
    }
  }
  return out;
}

/** Parse a .match DSL into {title, pairs:[{question, answer}]}. */
function parseMatch(p) {
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf8');
  const out = {pairs: []};
  const lines = raw.split('\n');
  let pendingQuestion = null;
  for (const line of lines) {
    let m;
    if ((m = line.match(/^title\s+['"](.+?)['"]\s*$/))) {
      out.title = m[1];
    } else if ((m = line.match(/^question\s+['"]([\s\S]+?)['"]\s*$/))) {
      pendingQuestion = m[1];
    } else if ((m = line.match(/^answer\s+['"]([\s\S]+?)['"]\s*$/))) {
      if (pendingQuestion !== null) {
        out.pairs.push({question: pendingQuestion, answer: m[1]});
        pendingQuestion = null;
      }
    } else if ((m = line.match(/^name\s+['"](.+?)['"]\s*$/))) {
      out.name = m[1];
    }
  }
  return out;
}

/** Parse a .bubble_choice DSL into {display_name, description, sublevels:[name,...]}. */
function parseBubbleChoice(p) {
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf8');
  const out = {sublevels: []};
  const lines = raw.split('\n');
  let inSublevels = false;
  for (const line of lines) {
    let m;
    if ((m = line.match(/^name\s+['"](.+?)['"]\s*$/))) {
      out.name = m[1];
    } else if ((m = line.match(/^display_name\s+['"](.+?)['"]\s*$/))) {
      out.display_name = m[1];
    } else if ((m = line.match(/^description\s+['"](.+?)['"]\s*$/))) {
      out.description = m[1];
    } else if (line.trim() === 'sublevels') {
      inSublevels = true;
    } else if (inSublevels && (m = line.match(/^level\s+['"](.+?)['"]\s*$/))) {
      out.sublevels.push(m[1]);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Locator helpers — find a level/contained file across dashboard subtrees.
// ---------------------------------------------------------------------------

const LEVEL_DIRS = [
  'levels/custom/spritelab',
  'levels/custom/standalone_video',
  'levels/custom/multi',
  'levels/custom/free_response',
  'levels/custom/bubble_choice',
  'levels/custom/external',
  'levels/custom/dancelab',
  // Capstone sub-levels live here (e.g. k5_ai_final_choice_level_poetry_lab).
  'levels/custom/poetry',
  'levels/custom/applab',
  'levels/custom/gamelab',
];

function findLevelFile(levelKey) {
  for (const d of LEVEL_DIRS) {
    const p = path.join(DASHBOARD, d, `${levelKey}.level`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function findContainedFile(name) {
  for (const ext of ['multi', 'match', 'bubble_choice', 'level_group']) {
    const p = path.join(DASHBOARD, 'scripts', `${name}.${ext}`);
    if (fs.existsSync(p)) return {path: p, ext};
  }
  return null;
}

/** Parse a .external DSL into {title, markdown}.  Used for text pages
 *  referenced via `text 'name'` inside a level_group. */
function parseExternal(p) {
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf8');
  const titleMatch = raw.match(/^title\s+['"](.+?)['"]\s*$/m);
  const displayMatch = raw.match(/^display_name\s+['"](.+?)['"]\s*$/m);
  const mdMatch = raw.match(/markdown\s*<<MARKDOWN\s*\n([\s\S]*?)\nMARKDOWN/);
  return {
    title: titleMatch ? titleMatch[1] : null,
    display_name: displayMatch ? displayMatch[1] : null,
    markdown: mdMatch ? mdMatch[1].trim() : '',
  };
}

/** Parse a .level_group DSL into {title, pages:[{kind, name}]}.
 *  Each `level 'name'` becomes a `level` page entry; each `text 'name'`
 *  becomes a `text` page entry; the kind drives the mobile rendering. */
function parseLevelGroup(p) {
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf8');
  const out = {pages: []};
  for (const line of raw.split('\n')) {
    let m;
    if ((m = line.match(/^name\s+['"](.+?)['"]\s*$/))) out.name = m[1];
    else if ((m = line.match(/^title\s+['"](.+?)['"]\s*$/))) out.title = m[1];
    else if ((m = line.match(/^level\s+['"](.+?)['"]\s*$/)))
      out.pages.push({kind: 'level', name: m[1]});
    else if ((m = line.match(/^text\s+['"](.+?)['"]\s*$/)))
      out.pages.push({kind: 'text', name: m[1]});
  }
  return out;
}

// ---------------------------------------------------------------------------
// Mobile shape mapping
// ---------------------------------------------------------------------------

/** Strip markdown/HTML for clean mobile display.  Handles: image
 *  references `![alt](url)`, links `[text](url)`, bold `**…**`, raw
 *  HTML tags, and multiple newlines. */
function stripMd(s) {
  if (!s) return '';
  return s
    .replace(/\r\n/g, '\n')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // ![alt](url) — remove
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) — keep text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Hand-curated activity content for SpriteLab drag levels.  The dashboard
 * stores the sprite/animation graph for these in `start_animations` /
 * `start_blocks`, which is meaningless on mobile (we don't run Sprite Lab).
 * The mobile re-render uses emoji-as-item with tap-into-bins.  This map
 * supplies the items + bins; the question text, instructions, and
 * pedagogical role are still inherited from the dashboard `.level` file.
 *
 * Updating: when prod swaps the assets, refresh these emoji to match
 * the spirit of the prod sprite (same animals, same colors, same shapes).
 */
const SPRITELAB_ACTIVITIES = {
  // L1 L1 — drag wings vs no-wings.  Prod tray items: elephant, duck,
  // horse, bluejay (sprite URLs lifted from sorting_items_wings.level's
  // start_animations).
  sorting_items_wings: {
    bins: [
      {key: 'wings', labelEn: 'Wings', labelHi: 'पंख'},
      {key: 'noWings', labelEn: 'No wings', labelHi: 'बिना पंख'},
    ],
    items: [
      {
        key: 'elephant',
        imageUrl:
          'https://studio.code.org/api/v1/animation-library/spritelab/sYt9h2Jn6zT5Af7RVVwfIzBcBW.9ZaqU/category_animals/elephant_1.png',
        binKey: 'noWings',
      },
      {
        key: 'duck',
        imageUrl:
          'https://studio.code.org/api/v1/animation-library/spritelab/JwUTdBccgUnE9CYFr9YqFalkytzvnmAI/category_animals/cuteanimals_duckling_hello.png',
        binKey: 'wings',
      },
      {
        key: 'horse',
        imageUrl:
          'https://studio.code.org/api/v1/animation-library/spritelab/ntmYko4Bb6PIqgj2wEI7XnAjH3F9XxeY/category_animals/horse.png',
        binKey: 'noWings',
      },
      {
        key: 'bluejay',
        imageUrl:
          'https://studio.code.org/api/v1/animation-library/spritelab/l2omFNj5BRBSnrWTi8D9Zdgn6HedUUGB/category_animals/bluejay.png',
        binKey: 'wings',
      },
    ],
  },
  // L1 L4 — continues L3's rules.  3 bins (shape / inside color / border
  // color), real prod sprites in tray.  Each item picked to map cleanly
  // to ONE bin (prod's ambiguity is the L3 lesson; L4 is the practice
  // round so cleanness > cleverness).
  sorting_items_by_fill_color: {
    bins: [
      {key: 'shape', labelEn: 'Box 1', labelHi: 'बॉक्स 1'}, // shapes: circles
      {key: 'inside', labelEn: 'Box 2', labelHi: 'बॉक्स 2'}, // red inside
      {key: 'border', labelEn: 'Box 3', labelHi: 'बॉक्स 3'}, // yellow border
    ],
    items: [
      {
        key: 'circle_white_blue_outline',
        imageUrl:
          'https://studio.code.org/api/v1/animation-library/level_animations/Y74nmDDWWOOZ_bX.CDnNPlyBddm.EBSL/circle_white_blue_outline.png',
        binKey: 'shape',
      },
      {
        key: 'circle_red_blue_outline',
        imageUrl:
          'https://studio.code.org/api/v1/animation-library/level_animations/H9tlDarmXdp2mcamaqFWQi0tkxCOqmRU/circle_red_blue_outline.png',
        binKey: 'shape',
      },
      {
        key: 'square_red',
        imageUrl:
          'https://studio.code.org/api/v1/animation-library/level_animations/Lx.kKhL8_KhvzijvUwKCe8UPAeHY1vfF/square_red.png',
        binKey: 'inside',
      },
      {
        key: 'triangle_red_black_outline',
        imageUrl:
          'https://studio.code.org/api/v1/animation-library/level_animations/r8yLH1pRgxZknLXY6POJ5vi8sV3XHjCM/triangle_red_black_outline.png',
        binKey: 'inside',
      },
      {
        key: 'square_yellow',
        imageUrl:
          'https://studio.code.org/api/v1/animation-library/level_animations/z7ONRb7zXgIjAIj3WKFAvFdrFx1Grva3/square_yellow.png',
        binKey: 'border',
      },
      {
        key: 'triangle_yellow_red_outline',
        imageUrl:
          'https://studio.code.org/api/v1/animation-library/level_animations/nSr6KWfjZgIHxHKWDlGB0D6SsBS9u7ON/triangle_yellow_red_outline.png',
        binKey: 'border',
      },
    ],
  },
  // L1 L5 — "Now these items are sorted in a NEW way."  Different sort
  // rule, fresh tray.  Prod sprites — sorted by SHAPE: circles, squares,
  // triangles (regardless of color).
  sorting_items_new: {
    bins: [
      {key: 'circle', labelEn: 'Circles', labelHi: 'गोल'},
      {key: 'square', labelEn: 'Squares', labelHi: 'चौकोर'},
      {key: 'triangle', labelEn: 'Triangles', labelHi: 'त्रिकोण'},
    ],
    items: [
      {
        key: 'circle_red',
        imageUrl:
          'https://studio.code.org/api/v1/animation-library/level_animations/srfrvvDOXCrGsBxi60VqRAzpDd_8Ca1D/circle_red.png',
        binKey: 'circle',
      },
      {
        key: 'circle_white_blue_outline',
        imageUrl:
          'https://studio.code.org/api/v1/animation-library/level_animations/Y74nmDDWWOOZ_bX.CDnNPlyBddm.EBSL/circle_white_blue_outline.png',
        binKey: 'circle',
      },
      {
        key: 'square_red',
        imageUrl:
          'https://studio.code.org/api/v1/animation-library/level_animations/Lx.kKhL8_KhvzijvUwKCe8UPAeHY1vfF/square_red.png',
        binKey: 'square',
      },
      {
        key: 'square_yellow',
        imageUrl:
          'https://studio.code.org/api/v1/animation-library/level_animations/z7ONRb7zXgIjAIj3WKFAvFdrFx1Grva3/square_yellow.png',
        binKey: 'square',
      },
      {
        key: 'triangle_red_black_outline',
        imageUrl:
          'https://studio.code.org/api/v1/animation-library/level_animations/r8yLH1pRgxZknLXY6POJ5vi8sV3XHjCM/triangle_red_black_outline.png',
        binKey: 'triangle',
      },
      {
        key: 'triangle_yellow_blue_outline',
        imageUrl:
          'https://studio.code.org/api/v1/animation-library/level_animations/PhijYCmIL91z7Cjsgc6tjTiJgHK69vwn/triangle_yellow_blue_outline.png',
        binKey: 'triangle',
      },
    ],
  },
  // L3 L1 — food feature vector (2D plot).
  k5_ai_pilot_sorting_foods_2024: {
    type: 'feature-grid',
    xAxisEn: {low: 'Not sweet', high: 'Really sweet'},
    yAxisEn: {low: 'Not for me', high: 'Love it!'},
    points: [
      {emoji: '🥦', x: 0.1, y: 0.2},
      {emoji: '🍎', x: 0.5, y: 0.7},
      {emoji: '🍦', x: 0.85, y: 0.9},
      {emoji: '🍕', x: 0.4, y: 0.85},
    ],
  },
};

/** Hard-coded YouTube IDs for standalone-video levels — used as a
 * fallback when videos.csv doesn't have a row for the level's
 * `video_key` (or the prod level doesn't declare one). */
const YOUTUBE_IDS = {
  oceans_video_elementary_machine_learning_2024: 'mrJeRNOPBTU',
  ai_data_dance_party_video_level: '_5azj0S5zc8',
};

/** Index of dashboard/config/videos.csv: {key: {youtubeCode, downloadUrl}}.
 *  Prod hosts the MP4 directly on `videos.code.org`, which sidesteps
 *  YouTube embed CSP issues — we prefer the MP4 over the YT embed. */
const VIDEO_INDEX = (() => {
  const csv = path.join(DASHBOARD, 'videos.csv');
  if (!fs.existsSync(csv)) return {};
  const lines = fs.readFileSync(csv, 'utf8').split('\n');
  const out = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 5) continue;
    // Columns: Key, Name, Concepts, YoutubeCode, Download, Locale.
    const key = cols[0];
    const youtubeCode = cols[3];
    const download = cols[4];
    if (!key) continue;
    out[key] = {
      youtubeCode: youtubeCode || null,
      downloadUrl: download || null,
    };
  }
  return out;
})();

/**
 * Evidence panels injected into mobile multi-choice levels.  Prod's multi
 * questions reference a side panel with sorted items ("look at the items
 * on the left").  Mobile has no left panel — the evidence inlines above
 * the question.  Keyed by the contained-level name (the `.multi` file).
 */
const EVIDENCE_FOR_MULTI = {
  // L1 L2 — items pre-sorted by color (the answer).  Prod sprites from
  // sorting_items_prediction.level's start_animations: red_apple,
  // ladybug, crab → red; cardBack/blue items → blue; face_broc, frog,
  // tennisball → green.
  ai_sorting_items_predict: {
    type: 'sorted-bins',
    // Bins are LABELLESS on purpose — naming them "Red/Green/Blue"
    // would hand the kid the answer.  Prod leaves the user to read the
    // visual grouping; mobile follows suit.
    bins: [
      {
        key: 'a',
        labelEn: 'Box 1',
        labelHi: 'बॉक्स 1',
        itemImageUrls: [
          'https://studio.code.org/api/v1/animation-library/spritelab/n68Mm_iZajtKGMo9B99AREwPvis0QrRR/category_food/red_apple.png',
          'https://studio.code.org/api/v1/animation-library/spritelab/Ok7O4m3kA4UMf6OKf6HN2zaLWgb7EDyW/category_animals/ladybug2.png',
          'https://studio.code.org/api/v1/animation-library/spritelab/aUGoWCStMRK1HP3USAg5q8WMQ4.SFSCb/category_animals/crab.png',
        ],
      },
      {
        key: 'b',
        labelEn: 'Box 2',
        labelHi: 'बॉक्स 2',
        itemImageUrls: [
          'https://studio.code.org/api/v1/animation-library/spritelab/UuhhfD7HZOrlOzFyu1V_StEDAawpMRxi/category_food/face_broc.png',
          'https://studio.code.org/api/v1/animation-library/spritelab/Pl3PQABiISN6c4AijHmQX7NuHiYf5Eh4/category_animals/frog_adult_csc.png',
          'https://studio.code.org/api/v1/animation-library/spritelab/xwiz_SqVZ8jGaLK6TPJ8iXPrSvGvvf9o/category_video_games/cactus.png',
        ],
      },
      {
        key: 'c',
        labelEn: 'Box 3',
        labelHi: 'बॉक्स 3',
        itemImageUrls: [
          'https://studio.code.org/api/v1/animation-library/level_animations/vd4vLDvezkF4ZAWjcRkBrQv1KkqPBIxj/blue_monster.png',
          'https://studio.code.org/api/v1/animation-library/spritelab/l2omFNj5BRBSnrWTi8D9Zdgn6HedUUGB/category_animals/bluejay.png',
          'https://studio.code.org/api/v1/animation-library/spritelab/cHLxyFtxN360bKiFE3JTx8wlVix.48O6/category_video_games/gameplay_bluestar.png',
        ],
      },
    ],
  },
  // L1 L3 — 3 unlabeled bins with actual prod sprite assets.  URLs lifted
  // verbatim from sorting_items_prediction_2.level's start_animations.
  // Each box's items demonstrate ONE sort rule; the rule name appears
  // only in the option list, never on the bin label (deliberate recall).
  ai_sorting_items_predict_2: {
    type: 'sorted-bins',
    subject: {
      // The "new item" the question asks about: a pink-colored circle
      // with a black border.  No exact prod asset for this hypothetical
      // — closest single-asset stand-in is `circle_red_blue_outline`
      // (red-filled circle with a colored border).  The text below makes
      // the spec explicit so the visual approximation is OK.
      labelEn: 'pink circle with black border',
      labelHi: 'गुलाबी गोला, काला बॉर्डर',
      imageUrl:
        'https://studio.code.org/api/v1/animation-library/level_animations/srfrvvDOXCrGsBxi60VqRAzpDd_8Ca1D/circle_red.png',
    },
    bins: [
      {
        key: 'a',
        labelEn: 'Box 1',
        labelHi: 'बॉक्स 1',
        // Sorted by SHAPE: all circles, varied borders/insides
        itemImageUrls: [
          'https://studio.code.org/api/v1/animation-library/level_animations/H9tlDarmXdp2mcamaqFWQi0tkxCOqmRU/circle_red_blue_outline.png',
          'https://studio.code.org/api/v1/animation-library/level_animations/Y74nmDDWWOOZ_bX.CDnNPlyBddm.EBSL/circle_white_blue_outline.png',
          'https://studio.code.org/api/v1/animation-library/level_animations/42Pgh0UHTPy2N2gFJ6AQpvjdUY4C5yJ_/circle_white_red_outline.png',
        ],
      },
      {
        key: 'b',
        labelEn: 'Box 2',
        labelHi: 'बॉक्स 2',
        // Sorted by INSIDE color: various shapes all red-filled
        itemImageUrls: [
          'https://studio.code.org/api/v1/animation-library/level_animations/srfrvvDOXCrGsBxi60VqRAzpDd_8Ca1D/circle_red.png',
          'https://studio.code.org/api/v1/animation-library/level_animations/Lx.kKhL8_KhvzijvUwKCe8UPAeHY1vfF/square_red.png',
          'https://studio.code.org/api/v1/animation-library/level_animations/r8yLH1pRgxZknLXY6POJ5vi8sV3XHjCM/triangle_red_black_outline.png',
        ],
      },
      {
        key: 'c',
        labelEn: 'Box 3',
        labelHi: 'बॉक्स 3',
        // Sorted by BORDER color: various shapes / fills with a common border color
        itemImageUrls: [
          'https://studio.code.org/api/v1/animation-library/level_animations/PhijYCmIL91z7Cjsgc6tjTiJgHK69vwn/triangle_yellow_blue_outline.png',
          'https://studio.code.org/api/v1/animation-library/level_animations/nSr6KWfjZgIHxHKWDlGB0D6SsBS9u7ON/triangle_yellow_red_outline.png',
          'https://studio.code.org/api/v1/animation-library/level_animations/z7ONRb7zXgIjAIj3WKFAvFdrFx1Grva3/square_yellow.png',
        ],
      },
    ],
  },
  // L3 — sweet snack pick: evidence shows a 2D feature grid above the question.
  // (Handled via SPRITELAB_ACTIVITIES feature-grid path for the foods level;
  //  for the food multi-choice below, just inline the example AI Snack output.)
};

/** Map a prod level key + parsed data to a mobile-shape `Level` object.
 *
 *  Returns { id, kind, variant, title, payload }.
 */
function levelToMobile(levelKey, progression, allStrings, allStringsHi) {
  const levelFile = findLevelFile(levelKey);
  const levelJson = levelFile ? parseLevelFile(levelFile) : null;
  const levelProps = levelJson?.properties ?? {};
  const containedNames = levelProps.contained_level_names ?? [];

  // Determine kind based on the file location / contained types
  const isStandaloneVideo = levelFile && levelFile.includes('standalone_video');
  const isBubbleChoiceFile = levelFile && levelFile.includes('bubble_choice');
  // Also check: does a top-level .bubble_choice exist for this level key?
  const topLevelBubbleChoice = path.join(
    DASHBOARD,
    'scripts',
    `${levelKey}.bubble_choice`,
  );
  const hasTopBubbleChoice = fs.existsSync(topLevelBubbleChoice);
  // Or a top-level .level_group (survey/page-group)?
  const topLevelGroup = path.join(
    DASHBOARD,
    'scripts',
    `${levelKey}.level_group`,
  );
  const hasTopLevelGroup = fs.existsSync(topLevelGroup);
  const containedFile = containedNames[0]
    ? findContainedFile(containedNames[0])
    : null;

  const id = levelKey.toLowerCase();
  // Use the progression name as the display title — this is what shows on
  // the journey bubble preview.  Falls back to display_name then the key.
  const titleEn = progression || levelProps.display_name || levelKey;

  // Top-level .match (e.g. k5_ai_matching_sort_data) — no .level wrapper,
  // emit as multi-with-evidence (the kid picks which rule matches each
  // arrangement).  The .match pairs are (image_or_label_question →
  // rule_answer).  On mobile we re-render as 3 unlabeled bins with the
  // arrangement images + a multi-choice asking which rule was used.
  const topLevelMatch = path.join(DASHBOARD, 'scripts', `${levelKey}.match`);
  if (!levelFile && fs.existsSync(topLevelMatch)) {
    const matchData = parseMatch(topLevelMatch);
    const titleKey = `level.${id}.title`;
    allStrings[titleKey] = matchData?.title || titleEn;
    allStringsHi[titleKey] = `[HI-TODO] ${matchData?.title || titleEn}`;
    // Prod intent: kid sees N unsorted-arrangement images and matches
    // each to one of N rule labels.  Mobile rendering: tap-image → tap-rule.
    //   - bins (rule labels) come from each pair.answer
    //   - items (arrangement images) come from each pair.question
    //   - item.binKey ties the i-th image to the i-th rule (the prod pairing)
    const pairs = matchData?.pairs || [];
    const bins = pairs.map((pair, i) => {
      const labelKey = `${id}.bin.${i}`;
      allStrings[labelKey] = stripMd(pair.answer);
      allStringsHi[labelKey] = `[HI-TODO] ${stripMd(pair.answer)}`;
      return {key: `bin${i}`, labelKey};
    });
    const items = pairs.map((pair, i) => {
      // pair.question is markdown like `![](url)` — pull the image URL.
      const imgMatch = /https?:\/\/[^\s)]+\.(?:png|jpg|jpeg|gif)/.exec(
        pair.question,
      );
      return {
        key: `item${i}`,
        ...(imgMatch ? {imageUrl: imgMatch[0]} : {emoji: '❓'}),
        binKey: `bin${i}`,
      };
    });
    const promptKey = `${id}.prompt`;
    allStrings[promptKey] =
      matchData?.title || 'Match each arrangement to its sorting rule.';
    allStringsHi[promptKey] = `[HI-TODO] ${allStrings[promptKey]}`;
    const doneKey = `${id}.done`;
    allStrings[doneKey] = 'Nice — you matched all the arrangements!';
    allStringsHi[doneKey] =
      '[HI-TODO] Nice — you matched all the arrangements!';
    return {
      id,
      kind: 'match',
      variant: 'activity',
      title: {
        en: matchData?.title || titleEn,
        hi: `[HI-TODO] ${matchData?.title || titleEn}`,
      },
      payload: {promptKey, bins, items},
    };
  }

  // Level group (survey / page-group) — load each page based on its kind:
  //   - `level` page with a .multi → multi-choice question
  //   - `level` page with a free_response .level → markdown prompt + ack
  //   - `text` page → markdown text block + ack
  if (hasTopLevelGroup) {
    const group = parseLevelGroup(topLevelGroup);
    const titleKey = `level.${id}.title`;
    allStrings[titleKey] = group?.title || titleEn;
    allStringsHi[titleKey] = `[HI-TODO] ${group?.title || titleEn}`;
    const pages = (group?.pages || []).map((page, pi) => {
      const pageName = page.name;
      if (page.kind === 'text') {
        // Text page in a level_group → a .external file with a markdown
        // heredoc body.  Fall back to .level long_instructions if no
        // .external exists (rare).
        const externalPath = path.join(
          DASHBOARD,
          'scripts',
          `${pageName}.external`,
        );
        let body = '';
        if (fs.existsSync(externalPath)) {
          const ext = parseExternal(externalPath);
          body = ext?.markdown || ext?.title || '';
        } else {
          const textLevel = findLevelFile(pageName);
          const tj = textLevel ? parseLevelFile(textLevel) : null;
          body = tj?.properties?.long_instructions || pageName;
        }
        const bodyKey = `${id}.page${pi}.body`;
        allStrings[bodyKey] = body;
        allStringsHi[bodyKey] = `[HI-TODO] ${body}`;
        return {kind: 'text', bodyKey};
      }
      // page.kind === 'level'
      const multiPath = path.join(DASHBOARD, 'scripts', `${pageName}.multi`);
      if (fs.existsSync(multiPath)) {
        const multi = parseMulti(multiPath);
        const questionKey = `${id}.page${pi}.q`;
        allStrings[questionKey] = stripMd(multi?.question || '');
        allStringsHi[questionKey] =
          `[HI-TODO] ${stripMd(multi?.question || '')}`;
        const options = (multi?.options || []).map((opt, oi) => {
          const optKey = `${id}.page${pi}.opt.${oi}`;
          allStrings[optKey] = stripMd(opt.text);
          allStringsHi[optKey] = `[HI-TODO] ${stripMd(opt.text)}`;
          return {key: optKey, correct: opt.correct};
        });
        return {kind: 'multi', questionKey, options};
      }
      // Free-response / other level — load .level file, render long_instructions as markdown.
      const lvlPath = findLevelFile(pageName);
      const lvl = lvlPath ? parseLevelFile(lvlPath) : null;
      const body = lvl?.properties?.long_instructions || pageName;
      const bodyKey = `${id}.page${pi}.body`;
      allStrings[bodyKey] = body;
      allStringsHi[bodyKey] = `[HI-TODO] ${body}`;
      return {kind: 'text', bodyKey};
    });
    return {
      id,
      kind: 'survey',
      variant: 'activity',
      title: {
        en: group?.title || titleEn,
        hi: `[HI-TODO] ${group?.title || titleEn}`,
      },
      payload: {pages},
    };
  }

  // Oceans special-case: kind=oceans-labeling
  if (levelKey.toLowerCase().startsWith('oceans_') && !isStandaloneVideo) {
    return {
      id,
      kind: 'oceans-labeling',
      variant: 'headline',
      title: {en: titleEn, hi: `[HI-TODO] ${titleEn}`},
      payload: {appMode: appModeForOceansLevel(levelKey)},
    };
  }

  // Standalone video
  if (isStandaloneVideo) {
    const titleKey = `level.${id}.title`;
    allStrings[titleKey] = titleEn;
    allStringsHi[titleKey] = `[HI-TODO] ${titleEn}`;
    // Look up the prod video via the level's `video_key` (preferred) or
    // the hand-curated fallback table.  Prefer the MP4 URL when present;
    // fall back to the YouTube id for the iframe path.
    const videoKey = levelProps.video_key;
    const entry = videoKey ? VIDEO_INDEX[videoKey] : null;
    const ytId = entry?.youtubeCode || YOUTUBE_IDS[levelKey] || null;
    const mp4Url = entry?.downloadUrl || null;
    const kind = levelKey.toLowerCase().includes('dance')
      ? 'dance-intro-video'
      : levelKey.toLowerCase().includes('oceans')
        ? 'oceans-video'
        : 'video';
    return {
      id,
      kind,
      variant: 'concept',
      title: {en: titleEn, hi: `[HI-TODO] ${titleEn}`},
      payload: {
        youtubeId: ytId,
        mp4Url,
        titleKey,
        thumbnailId: id,
        durationSec: 120,
      },
    };
  }

  // Bubble choice — capstone choice level (top-level .bubble_choice OR
  // a level file in the bubble_choice subdir).
  if (
    hasTopBubbleChoice ||
    isBubbleChoiceFile ||
    (containedFile && containedFile.ext === 'bubble_choice')
  ) {
    const bcFile = hasTopBubbleChoice
      ? topLevelBubbleChoice
      : isBubbleChoiceFile
        ? path.join(DASHBOARD, 'scripts', `${levelKey}.bubble_choice`)
        : containedFile.path;
    const bc = parseBubbleChoice(bcFile);
    const titleKey = `level.${id}.title`;
    allStrings[titleKey] = bc?.display_name || titleEn;
    allStringsHi[titleKey] = `[HI-TODO] ${bc?.display_name || titleEn}`;
    const options = (bc?.sublevels || []).map(slKey => {
      // Try .level (JSON-wrapped) first; if none, fall back to .external
      // (DSL with `display_name 'X'` and `title 'X'` lines).
      const slFile = findLevelFile(slKey);
      const slJson = slFile ? parseLevelFile(slFile) : null;
      let slDisplay = slJson?.properties?.display_name;
      if (!slDisplay) {
        const extPath = path.join(DASHBOARD, 'scripts', `${slKey}.external`);
        if (fs.existsSync(extPath)) {
          const ext = parseExternal(extPath);
          slDisplay = ext?.display_name || ext?.title;
        }
      }
      const optKey = `${id}.opt.${slKey}`;
      allStrings[optKey] = slDisplay || slKey;
      allStringsHi[optKey] = `[HI-TODO] ${slDisplay || slKey}`;
      return {key: optKey, sourceKey: slKey};
    });
    return {
      id,
      kind: 'bubble-choice',
      variant: 'capstone',
      title: {
        en: bc?.display_name || titleEn,
        hi: `[HI-TODO] ${bc?.display_name || titleEn}`,
      },
      payload: {options, descriptionRaw: bc?.description || ''},
    };
  }

  // Multi-choice contained
  if (containedFile && containedFile.ext === 'multi') {
    const multi = parseMulti(containedFile.path);
    const titleKey = `level.${id}.title`;
    allStrings[titleKey] = titleEn;
    allStringsHi[titleKey] = `[HI-TODO] ${titleEn}`;
    const questionKey = `${id}.q`;
    // Massage the prod question text: mobile has no left panel, so rewrite
    // "items on the left" → "items above".
    const cookedQuestion = stripMd(multi?.question || '')
      .replace(/items on the left/gi, 'items above')
      .replace(/on the left/gi, 'above');
    allStrings[questionKey] = cookedQuestion;
    allStringsHi[questionKey] = `[HI-TODO] ${cookedQuestion}`;
    const options = (multi?.options || []).map((opt, i) => {
      const optKey = `${id}.opt.${i}`;
      // Preserve markdown — the renderer's <Markdown> component handles
      // **bold**, links, and images.  Strip only the markdown-image
      // syntax which we never want to render inline inside an option.
      const cleanText = (opt.text || '')
        .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
        .trim();
      allStrings[optKey] = cleanText;
      allStringsHi[optKey] = `[HI-TODO] ${cleanText}`;
      return {key: optKey, correct: opt.correct};
    });

    // Inline evidence above the question, if we have a hand-curated map.
    const evSpec = EVIDENCE_FOR_MULTI[containedNames[0]];
    let evidence;
    if (evSpec?.type === 'sorted-bins') {
      const bins = evSpec.bins.map(b => {
        const labelKey = `${id}.evidence.${b.key}`;
        allStrings[labelKey] = b.labelEn;
        allStringsHi[labelKey] = b.labelHi;
        const out = {key: b.key, labelKey};
        if (b.itemImageUrls) out.itemImageUrls = b.itemImageUrls;
        if (b.itemEmojis) out.itemEmojis = b.itemEmojis;
        return out;
      });
      evidence = {type: 'sorted-bins', bins};
      if (evSpec.subject) {
        const subj = {};
        if (evSpec.subject.imageUrl) subj.imageUrl = evSpec.subject.imageUrl;
        if (evSpec.subject.emoji) subj.emoji = evSpec.subject.emoji;
        if (evSpec.subject.labelEn) {
          const labelKey = `${id}.subject.label`;
          allStrings[labelKey] = evSpec.subject.labelEn;
          allStringsHi[labelKey] =
            evSpec.subject.labelHi || `[HI-TODO] ${evSpec.subject.labelEn}`;
          subj.labelKey = labelKey;
        }
        evidence.subject = subj;
      }
    }

    return {
      id,
      kind: 'multi',
      variant: 'activity',
      title: {en: titleEn, hi: `[HI-TODO] ${titleEn}`},
      payload: {questionKey, options, ...(evidence ? {evidence} : {})},
    };
  }

  // Match contained — dashboard .match has (question/image, answer/label) pairs.
  // We render as multi-with-evidence: each "pair" becomes a sorted-bin row.
  if (containedFile && containedFile.ext === 'match') {
    const matchData = parseMatch(containedFile.path);
    const titleKey = `level.${id}.title`;
    allStrings[titleKey] = matchData?.title || titleEn;
    allStringsHi[titleKey] = `[HI-TODO] ${matchData?.title || titleEn}`;
    const items = (matchData?.pairs || []).map((pair, i) => {
      const itemKey = `${id}.item.${i}`;
      const binKey = `${id}.bin.${i}`;
      allStrings[itemKey] = stripMd(pair.question);
      allStrings[binKey] = stripMd(pair.answer);
      allStringsHi[itemKey] = `[HI-TODO] ${stripMd(pair.question)}`;
      allStringsHi[binKey] = `[HI-TODO] ${stripMd(pair.answer)}`;
      return {key: itemKey, binKey, emoji: '🔵'};
    });
    const bins = items.map(it => ({key: it.binKey, labelKey: it.binKey}));
    return {
      id,
      kind: 'match',
      variant: 'activity',
      title: {
        en: matchData?.title || titleEn,
        hi: `[HI-TODO] ${matchData?.title || titleEn}`,
      },
      payload: {promptKey: `${id}.prompt`, bins, items},
    };
  }

  // Fallback: SpriteLab drag level with no contained .multi/.match.  Inject
  // hand-curated mobile activity content from SPRITELAB_ACTIVITIES if we have
  // it; otherwise emit an empty marker.
  const titleKey = `level.${id}.title`;
  allStrings[titleKey] = titleEn;
  allStringsHi[titleKey] = `[HI-TODO] ${titleEn}`;
  const promptKey = `${id}.prompt`;
  const promptRaw = stripMd(levelProps.long_instructions || '');
  allStrings[promptKey] = promptRaw || 'Tap an item, then tap a bin.';
  allStringsHi[promptKey] =
    '[HI-TODO] ' + (promptRaw || 'Tap an item, then tap a bin.');

  const handCurated = SPRITELAB_ACTIVITIES[levelKey];
  if (handCurated) {
    if (handCurated.type === 'feature-grid') {
      // 2D feature-vector chart — emit as multi with feature-grid evidence.
      // Question text inherited from the level long_instructions.
      const questionKey = `${id}.q`;
      const xLowKey = `${id}.x.low`,
        xHighKey = `${id}.x.high`;
      const yLowKey = `${id}.y.low`,
        yHighKey = `${id}.y.high`;
      allStrings[questionKey] =
        promptRaw.slice(0, 200) || 'Which item is the highest on both axes?';
      allStringsHi[questionKey] = '[HI-TODO] ' + allStrings[questionKey];
      allStrings[xLowKey] = handCurated.xAxisEn.low;
      allStringsHi[xLowKey] = '[HI-TODO] ' + handCurated.xAxisEn.low;
      allStrings[xHighKey] = handCurated.xAxisEn.high;
      allStringsHi[xHighKey] = '[HI-TODO] ' + handCurated.xAxisEn.high;
      allStrings[yLowKey] = handCurated.yAxisEn.low;
      allStringsHi[yLowKey] = '[HI-TODO] ' + handCurated.yAxisEn.low;
      allStrings[yHighKey] = handCurated.yAxisEn.high;
      allStringsHi[yHighKey] = '[HI-TODO] ' + handCurated.yAxisEn.high;
      return {
        id,
        kind: 'multi',
        variant: 'activity',
        title: {en: titleEn, hi: `[HI-TODO] ${titleEn}`},
        payload: {
          questionKey,
          evidence: {
            type: 'feature-grid',
            xAxis: {low: xLowKey, high: xHighKey},
            yAxis: {low: yLowKey, high: yHighKey},
            items: handCurated.points,
          },
          options: [],
        },
      };
    }
    // Tap-into-bins activity.
    const bins = handCurated.bins.map(b => {
      const labelKey = `${id}.bin.${b.key}`;
      allStrings[labelKey] = b.labelEn;
      allStringsHi[labelKey] = b.labelHi;
      return {key: b.key, labelKey};
    });
    return {
      id,
      kind: 'match',
      variant: 'activity',
      title: {en: titleEn, hi: `[HI-TODO] ${titleEn}`},
      payload: {
        promptKey,
        bins,
        items: handCurated.items,
      },
    };
  }

  // No hand-curation either — bare placeholder.
  return {
    id,
    kind: 'match',
    variant: 'activity',
    title: {en: titleEn, hi: `[HI-TODO] ${titleEn}`},
    payload: {sourceKey: levelKey, promptRaw, bins: [], items: []},
  };
}

/** Map an Oceans level key to its lab AppMode. */
function appModeForOceansLevel(levelKey) {
  const k = levelKey.toLowerCase();
  if (k.includes('fishvtrash') && !k.includes('demo')) return 'fishvtrash';
  if (k.includes('creaturesvtrashdemo')) return 'creaturesvtrashdemo';
  if (k.includes('creaturesvtrash')) return 'creaturesvtrash';
  if (k.includes('long')) return 'long';
  return 'fishvtrash';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const SECTION_TINTS = {
  1: 'neutral.sand',
  2: 'blue.light',
  3: 'purple.light',
  4: 'green.light',
  5: 'orange.light',
};

const scriptJsonPath = path.join(
  DASHBOARD,
  'scripts_json',
  'k5-ai-data-2024.script_json',
);
const scriptJson = JSON.parse(fs.readFileSync(scriptJsonPath, 'utf8'));

const allStrings = {};
const allStringsHi = {};
const lessons = scriptJson.lessons.map((l, idx) => {
  const lessonNum = idx + 1;
  return {
    id: lessonNum,
    name: {en: l.name, hi: `[HI-TODO] ${l.name}`},
    pathIndex: idx,
    sectionTint: SECTION_TINTS[lessonNum] || 'neutral.sand',
    levels: [],
  };
});

// Walk script_levels in order, place them in their lesson.
// Position+chapter aren't directly the lesson index; use seeding_key.lesson.key
// to find the matching lesson.  Fall back to scanning lessons sequentially.
const lessonByKey = new Map();
for (const l of scriptJson.lessons) {
  lessonByKey.set(l.key, l);
}
// Build lesson key → mobile lesson index map.
const lessonKeyToIdx = new Map();
scriptJson.lessons.forEach((l, i) => lessonKeyToIdx.set(l.key, i));

for (const sl of scriptJson.script_levels) {
  const levelKey = sl.level_keys?.[0];
  if (!levelKey) continue;
  const progression = sl.properties?.progression || '';
  const lessonKey = sl.seeding_key?.['lesson.key'] || '';
  const lessonIdx = lessonKeyToIdx.get(lessonKey) ?? 0;

  const mobileLevel = levelToMobile(
    levelKey,
    progression,
    allStrings,
    allStringsHi,
  );
  // Stamp lesson title string
  const lessonNum = lessonIdx + 1;
  allStrings[`lesson.${lessonNum}.name`] = scriptJson.lessons[lessonIdx].name;
  allStringsHi[`lesson.${lessonNum}.name`] =
    `[HI-TODO] ${scriptJson.lessons[lessonIdx].name}`;
  lessons[lessonIdx].levels.push(mobileLevel);
}

const unit = {
  id: 'k5-ai-data-2024',
  name: {en: 'How AI Makes Decisions', hi: '[HI-TODO] How AI Makes Decisions'},
  units: [
    {
      id: 1,
      name: {en: 'Unit 1', hi: '[HI-TODO] Unit 1'},
      lessons,
    },
  ],
};

const outUnit = path.join(OUT_DIR, 'unit1.json');
const outStringsEn = path.join(OUT_DIR, 'strings.en.json');
const outStringsHi = path.join(OUT_DIR, 'strings.hi.json');
const banner = {
  _generated: STAMP,
  _source: 'dashboard/config/scripts_json/k5-ai-data-2024.script_json',
};
fs.writeFileSync(outUnit, JSON.stringify({...banner, ...unit}, null, 2) + '\n');
fs.writeFileSync(
  outStringsEn,
  JSON.stringify({_generated: STAMP, ...allStrings}, null, 2) + '\n',
);
fs.writeFileSync(
  outStringsHi,
  JSON.stringify({_generated: STAMP, ...allStringsHi}, null, 2) + '\n',
);

console.log(`✓ Wrote ${outUnit}`);
console.log(`✓ Wrote ${outStringsEn}`);
console.log(`✓ Wrote ${outStringsHi}`);
console.log(
  `  Lessons: ${lessons.length}, total levels: ${lessons.reduce((n, l) => n + l.levels.length, 0)}`,
);
