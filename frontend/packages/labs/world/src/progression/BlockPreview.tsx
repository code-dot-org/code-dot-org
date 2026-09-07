// The block a lesson gives you, drawn as itself.
//
// The Unlocks list said "the Jumping rule" and "the world_do_Jumping_MakeJump
// block", and neither of those is a thing a learner has ever seen. What they
// will see is a shape with words on it, in a color, and that is the only
// description of a block anybody reads — so this shows one.
//
// THROUGH `BlocklyMarkdown`, which is the platform's own way of putting a
// block in a sentence: it renders markdown and turns each embedded `<xml>`
// into a live inline workspace. The lesson instructions in the pane above
// already go through a markdown renderer, so a block drawn here is drawn by
// the same machinery that would draw one in a lesson — and a picture of a
// block would be a picture that goes stale the day somebody renames a field.
//
// THE PALETTE IS BUILT FROM EVERY STOCK RULE, and that is the point rather
// than an oversight. The whole reason to draw a block here is that the learner
// has NOT unlocked it yet: the project they have open does not hold the rule,
// so the editor's own palette has never minted its blocks and cannot draw one.
// So this builds its own from the library, once, and only when a dialog asks.

import {useMemo} from 'react';

import {BlocklyMarkdown, BlocklyProvider} from '@code-dot-org/blockly';

import {buildDomainPalette} from '../blockly/domainBlocks';
import {parseRuleMeta, type RuleMeta} from '../blockly/ruleMeta';
import {memberValue, ruleSlug} from '../blockly/ruleRegistry';
import {STOCK_RULES} from '../rules/stock';

import styles from './progressionDialog.module.css';

/**
 * Every block the library can mint, and which rule minted it.
 *
 * Computed once for the life of the module rather than per render: it parses
 * forty rule workspaces, and the answer is a fact about the library rather
 * than about anything on screen. Lazily, though — a lab that never opens the
 * progression dialog should never pay for it.
 */
/** A block as a preview needs it: a type, and any field it must be set to. */
export interface PreviewBlock {
  type: string;
  fields?: Record<string, string>;
}

let cached: {
  blocks: ReturnType<typeof buildDomainPalette>['blocks'];
  byRule: Map<string, string[]>;
  traitOf: Map<string, string>;
} | null = null;

const library = () => {
  if (cached) {
    return cached;
  }
  const parsed = STOCK_RULES.map(rule => ({
    id: rule.id,
    meta: parseRuleMeta(`rules/${rule.id}`, rule.contents),
  })).filter(
    (one): one is {id: string; meta: RuleMeta} => one.meta !== undefined,
  );
  const {blocks} = buildDomainPalette(
    parsed.map(one => one.meta),
    {allRuleModules: true},
  );
  // Which blocks belong to which rule, by the SLUG the minting used — read off
  // the palette rather than re-derived, because a second copy of that naming
  // would be a second chance to get it wrong.
  const byRule = new Map<string, string[]>();
  // …and the first trait each rule declares, as the value a `use trait` field
  // stores. For the sixteen rules that have no verb at all, that row IS what
  // the lesson gives you.
  const traitOf = new Map<string, string>();
  for (const {id, meta} of parsed) {
    const slug = ruleSlug(meta.name);
    byRule.set(
      id,
      blocks
        .map(block => block.type)
        .filter(type => type.includes(`_${slug}_`)),
    );
    const first = meta.traits[0];
    if (first) {
      traitOf.set(id, memberValue(first.ref));
    }
  }
  cached = {blocks, byRule, traitOf};
  return cached;
};

/**
 * The one block worth drawing for a whole rule.
 *
 * A rule mints a dozen — a getter and a setter for every property, a hat for
 * every event — and a list of twelve is not a picture of anything. What a rule
 * IS, to somebody deciding whether to do the lesson, is the thing it lets you
 * do, so an action wins and a question is the next best.
 *
 * AND FAILING BOTH, THE TRAIT. Sixteen of the stock rules have no verb at all
 * — Arrow Keys, Gravity, Collisions — because what they give you is a way for
 * an actor to BE something. The block a learner writes for one of those is
 * `use trait ⟨Moves Across⟩`, and that is a truer picture of the lesson than
 * any getter it also happens to mint.
 */
export const blockForRule = (id: string): PreviewBlock | undefined => {
  const {byRule, traitOf} = library();
  const types = byRule.get(id) ?? [];
  const verb =
    types.find(type => type.startsWith('world_do_')) ??
    types.find(type => type.startsWith('world_query_'));
  if (verb) {
    return {type: verb};
  }
  const trait = traitOf.get(id);
  return trait ? {type: 'world_use_trait', fields: {TRAIT: trait}} : undefined;
};

/**
 * One block as the `<xml>` `BlocklyMarkdown` embeds.
 *
 * A field is a `<title>` rather than a `<field>`: that is the element the XML
 * reader here takes, and the platform's own test writes it the same way.
 */
export const blockXml = (block: PreviewBlock): string =>
  [
    `<xml><block type="${block.type}">`,
    ...Object.entries(block.fields ?? {}).map(
      ([name, value]) =>
        `<title name="${escapeXml(name)}">${escapeXml(value)}</title>`,
    ),
    '</block></xml>',
  ].join('');

/**
 * What a block's definition says about itself, if it is a sentence.
 *
 * A tooltip may be a function — a block that describes itself differently
 * depending on its own fields — and one of those needs a live block to call
 * it with. A preview has none, so those get nothing rather than a wrong
 * answer.
 */
const tooltipOf = (definition: {tooltip?: unknown}): string | undefined =>
  typeof definition.tooltip === 'string' ? definition.tooltip : undefined;

const escapeXml = (text: string): string =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('"', '&quot;');

export interface BlockPreviewProps {
  block: PreviewBlock;
}

export const BlockPreview = ({block}: BlockPreviewProps) => {
  const {blocks} = library();
  const definition = blocks.find(one => one.type === block.type);
  const content = useMemo(() => blockXml(block), [block]);
  if (!definition) {
    return null;
  }
  return (
    // The block's own tooltip, as a `title`. Blockly's tooltips are bound to
    // the elements of a LIVE block, and an inline preview is a copy of the
    // rendered SVG with no JavaScript attached to it — so hovering the picture
    // would say nothing at all. The definition's tooltip is the same sentence
    // the real block shows, read from the same place.
    <span className={styles.blockPreview} title={tooltipOf(definition)}>
      {/* The provider as well as the prop. The prop registers the definitions
          in an effect, which can land AFTER the workspace has already tried to
          load the block — and a workspace asked for a type it does not know
          throws out of `load`, which is the same call that fits an inline
          workspace to its block. The visible half of that is a preview the
          height of the whole reading pane. The provider has them before the
          workspace is injected. */}
      <BlocklyProvider blocks={blocks}>
        <BlocklyMarkdown content={content} blocks={blocks} />
      </BlocklyProvider>
    </span>
  );
};
