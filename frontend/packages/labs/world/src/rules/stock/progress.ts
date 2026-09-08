// "Shows Progress" — how far along something is, as a number between 0 and 1.
//
// WRITING'S SIBLING, and written to be read beside it. That rule owns the words
// an actor says and paints none of them; this owns the FRACTION an actor is at
// and paints none of it either. A Label draws the one, a Progress Bar draws the
// other, and both are actors in the library rather than anything the engine
// knows about (specs/UI_ACTORS.md).
//
// WHY IT IS A RULE AND NOT THE BAR'S OWN NUMBER — and the reason is SHARING,
// which is not the reason this used to give.
//
// It used to say that a `define property` in an `.actor` file mints its
// getter and setter into that file's palette and NOWHERE ELSE, so a bar
// keeping its own fraction would be a bar nothing could fill. That stopped
// being true when an actor's own properties became exported and every actor's
// landed in every file's palette — which is how the stock Health Bar keeps
// `subject`, a name for something no rule has any business owning.
//
// What is left is the argument that was always the real one. A Progress Bar, a
// Health Bar and a Fuel Bar all mean the same thing by `fraction`, and a rule
// is for what is SHARED — the test `specs/UI_ACTORS.md` states while working
// out that same Health Bar: `text` is Writing's because a Label and a Button
// and a Score all mean the same thing by it, and `subject` is the bar's own
// because nobody else means anything by it at all.
//
// AND THE TRAIT IS THE ONLY THING THAT NAMES THE FAMILY. A Health Bar ACTS
// LIKE a Progress Bar, and kinds are not inherited — an instance carries the
// module it was placed from, so a Health Bar is never one of
// `any ⟨Progress Bar⟩` (`ActorBuilder.actsLike`). What carries across is the
// trait, so `⟨has trait ⟨Shows Progress⟩⟩` is the only way to say "every bar
// in this game", and there would be no way to say it without this rule.
//
// A RULE WITH NO STEPS. Nothing about a fraction happens over time: what moves
// it is a project's own handler — a coin taken, a hit landed, a file loaded —
// and what draws it is the actor that elected this. It exists to be elected
// and to be set.
//
// NOT CLAMPED, and it does not need to be. A fraction above 1 draws a bar
// wider than its canvas and a canvas is what a drawing is rasterized into, so
// it is clipped by the picture rather than by arithmetic; below 0 there is
// nothing to draw. Rejecting the number instead would mean a rule that
// silently disagrees with the block that set it.
//
// HORIZONTAL IS NOT A CHOICE THIS MAKES. A bar drawn along x and turned
// ninety degrees is a bar drawn along y — rotation is already every actor's,
// so a "direction" here would be a second way to say something the language
// says already.

/** The `rules/progress.rule` workspace. GENERATED — edit scripts/rules/progress.mjs. */
export const progressRule =
  '{\n  "blocks": {\n    "languageVersion": 0,\n    "blocks": [\n      {\n        "type": "world_rule",\n        "fields": {\n          "NAME": "Progress",\n          "ABILITY": "Shows Progress"\n        },\n        "next": {\n          "block": {\n            "type": "world_doc",\n            "fields": {\n              "DOC": "**Progress** is how far along something is, as a number between 0 and 1.\\n\\nHealth left, a bar filling, a level part-finished. It owns the *fraction* and\\npaints none of it \\u2014 a Progress Bar actor draws it, the way a Label draws\\nWriting\'s words.\\n\\nGive anything with a fraction **Shows Progress**."\n            }\n          }\n        },\n        "x": 20,\n        "y": 20\n      },\n      {\n        "type": "world_rule_trait",\n        "fields": {\n          "NAME": "Shows Progress"\n        },\n        "next": {\n          "block": {\n            "type": "world_rule_property",\n            "fields": {\n              "TYPE": "number",\n              "ACCESS": "writable",\n              "NAME": "fraction",\n              "DEFAULT": "1"\n            },\n            "next": {\n              "block": {\n                "type": "world_rule_property",\n                "fields": {\n                  "TYPE": "color",\n                  "ACCESS": "writable",\n                  "NAME": "bar color",\n                  "DEFAULT": "#e04040"\n                },\n                "next": {\n                  "block": {\n                    "type": "world_rule_property",\n                    "fields": {\n                      "TYPE": "color",\n                      "ACCESS": "writable",\n                      "NAME": "track color",\n                      "DEFAULT": "#301820"\n                    },\n                    "next": {\n                      "block": {\n                        "type": "world_doc",\n                        "fields": {\n                          "DOC": "**A fraction, and two colors.** That is the whole rule \\u2014 it owns how far along something is and draws none of it.\\n\\n`fraction` runs from 0 to 1: empty to full. A Progress Bar actor reads it and paints that much of itself in the bar color and the rest in the track color, the way a Label reads Writing\'s words.\\n\\nAnything that is a proportion belongs here \\u2014 health left, a level part-finished, a charge building. Work out the fraction with a division (`health / max health`) and set it; keeping it between 0 and 1 is Boundaries\' `keep between` block.\\n\\nIt starts FULL, so a bar nobody has told anything to reads as a bar rather than as an empty frame that looks deliberate."\n                        }\n                      }\n                    }\n                  }\n                }\n              }\n            }\n          }\n        },\n        "x": 20,\n        "y": 376\n      }\n    ]\n  }\n}\n';
