// "Types out what it says" — the typewriter, given to anything with words.
//
// It was the Speech Box's alone, and before that it was a rule nothing but a
// Speech Box elected (`actors/typewriter` tells that half). What makes it an
// enhancement is the test this shelf sets: more than one edit, or a companion
// actor, or a line aiming two things at each other. This is six declarations,
// two elected traits and a handler, none of which works without the rest —
// and none of which is "elect this trait", which belongs on the rule shelf.
//
// WHAT IT WRITES, all of it in the actor:
//
//   actors/<target>.actor    use trait ⟨Writing#Shows Text⟩
//                            use trait ⟨Time#Has a Timer⟩
//
//                            define read-only string ⟨the whole line⟩
//                            define number ⟨letters a second⟩ = 20
//                            define event ⟨finishes revealing⟩
//                            define block ⟨say ⟨words⟩⟩
//                            define block ⟨show all of it⟩
//                            set ⟨timer runs⟩ of ⟨this actor⟩ to ⟨no⟩
//
//                            when ⟨this actor⟩'s timer fires:
//                              …one more letter, and the cue on the last
//
// THE SAME BLOCKS THE SPEECH BOX SHIPS WITH, from the same place, so the two
// cannot drift. What differs is only the module path they are named after: an
// own member's block type carries its declaring file, which is what keeps a
// Label's `say` apart from a Sign's (`ruleRegistry.memberLocalName`).
//
// IT DOES NOT DRAW THE WORDS, and that is the division `Shows Text` already
// makes: this decides how much of the line is showing and the actor decides
// what showing looks like. A Label, a Button and a Speech Box all draw `text`
// already, so any of them types itself out with nothing else done. An actor
// that draws no text gets a line nobody can see — which is the same thing that
// happens to an actor given `Shows Text` by hand, and the reason `brings` says
// the trait arrives.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {importStockRule} from '../../rules/importStockRule';
import {STOCK_RULES} from '../../rules/stock';
import {fileIdAt} from '../../runtime/projectFiles';
import {typewriterFor, TYPEWRITER_TRAITS} from '../typewriter';

import type {Enhancement, EnhanceTarget} from './enhancements';
import {addRoot, append, holds, type BlockJson} from './patch';

/** The rules the two traits come from, in the order they are elected in. */
const RULES = ['Writing', 'Time'];

/** The `define actor` this patch lands under — a file's only one. */
const ROOT = {type: 'world_actor'};

/** Whether a `use trait` for `trait` is already in the actor's chain. */
const hasTrait = (contents: string, trait: string): boolean =>
  holds(
    contents,
    ROOT,
    block => block.type === 'world_use_trait' && block.fields?.TRAIT === trait,
  );

/**
 * Whether this actor already has a typewriter.
 *
 * `the whole line` is what says so: it is the one declaration that means
 * nothing else, where `Shows Text` is elected by half the interface actors and
 * a timer by anything that does something on a beat.
 */
const hasTypewriter = (contents: string): boolean =>
  holds(
    contents,
    ROOT,
    block =>
      block.type === 'world_rule_property' &&
      block.fields?.NAME === 'the whole line',
  );

/** Rewrite one file's contents, leaving the rest of the project alone. */
const edit = (
  source: MultiFileSource,
  id: string,
  change: (contents: string) => string,
): MultiFileSource => ({
  ...source,
  files: {
    ...source.files,
    [id]: {...source.files[id], contents: change(source.files[id].contents)},
  },
});

export const typesOutTextEnhancement: Enhancement = {
  id: 'typesOutText',
  // The ACTOR's, and entirely: the declarations, the handler and the words are
  // all facts about this kind, and no world is touched.
  subject: 'actor',
  name: 'Types out what it says',
  description:
    'Gives this actor a line it says a few letters at a time. “Say” starts one, “show all of it” skips to the end for a reader who has read ahead, and “finishes revealing” is the cue to move on. What draws the words is the actor’s own business — a Label, a Button and a Speech Box already draw their text.',
  brings: ['Shows Text', 'Keeps Time'],
  refuse(target: EnhanceTarget) {
    // AN ACTOR A WORLD DEFINES FOR ITSELF CANNOT TAKE IT. Its body generates
    // into a block scope, and `define block` and `define event` both emit an
    // `export const`, which is not legal there — so the palette does not offer
    // either inside a world's own `define actor` and the generator refuses one
    // pasted in (`blockly/fileKind`, `domainBlocks.definesActorFile`). Writing
    // the rows anyway would leave a file that silently generates nothing.
    return target.block
      ? 'This actor is defined inside its world, which cannot hold a “define block”. Give it a file of its own first.'
      : undefined;
  },
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const id = fileIdAt(source, `${target.path}.actor`);
    return id ? hasTypewriter(source.files[id].contents) : false;
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    let current = source;
    for (const name of RULES) {
      const rule = STOCK_RULES.find(one => one.name === name);
      if (rule) {
        current = importStockRule(current, rule).source;
      }
    }

    const id = fileIdAt(current, `${target.path}.actor`);
    if (!id) {
      return current;
    }
    const typewriter = typewriterFor(target.path);
    return edit(current, id, contents => {
      if (hasTypewriter(contents)) {
        return contents;
      }
      const traits = TYPEWRITER_TRAITS.filter(
        trait => !hasTrait(contents, trait),
      ).map(trait => ({type: 'world_use_trait', fields: {TRAIT: trait}}));
      // One append, because `append` walks to the end of the chain each time
      // and the rows have to arrive in the order they are written above.
      const next = append(
        contents,
        ROOT,
        [...traits, ...typewriter.rows] as BlockJson[],
        typewriter.variables,
      );
      return addRoot(next, typewriter.handler as BlockJson);
    });
  },
};
