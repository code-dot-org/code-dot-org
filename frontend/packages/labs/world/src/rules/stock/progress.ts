// "Shows Progress" — how far along something is, as a number between 0 and 1.
//
// WRITING'S SIBLING, and written to be read beside it. That rule owns the words
// an actor says and paints none of them; this owns the FRACTION an actor is at
// and paints none of it either. A Label draws the one, a Progress Bar draws the
// other, and both are actors in the library rather than anything the engine
// knows about (specs/UI_ACTORS.md).
//
// WHY IT IS A RULE AND NOT THE BAR'S OWN NUMBER. A `define property` in an
// `.actor` file mints its getter and setter into that file's palette and
// NOWHERE ELSE, so a bar that kept its own fraction would be a bar nothing
// could fill. The whole point of a progress bar is that something else moves
// it. Writing's header makes the same argument about a score's text, and this
// is that argument again with a number in it.
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
  '{\n  "blocks": {\n    "languageVersion": 0,\n    "blocks": [\n      {\n        "type": "world_rule",\n        "fields": {\n          "NAME": "Progress",\n          "ABILITY": "Shows Progress"\n        },\n        "x": 20,\n        "y": 20\n      },\n      {\n        "type": "world_rule_trait",\n        "fields": {\n          "NAME": "Shows Progress"\n        },\n        "next": {\n          "block": {\n            "type": "world_rule_property",\n            "fields": {\n              "TYPE": "number",\n              "ACCESS": "writable",\n              "NAME": "fraction",\n              "DEFAULT": "1"\n            },\n            "next": {\n              "block": {\n                "type": "world_rule_property",\n                "fields": {\n                  "TYPE": "color",\n                  "ACCESS": "writable",\n                  "NAME": "bar color",\n                  "DEFAULT": "#e04040"\n                },\n                "next": {\n                  "block": {\n                    "type": "world_rule_property",\n                    "fields": {\n                      "TYPE": "color",\n                      "ACCESS": "writable",\n                      "NAME": "track color",\n                      "DEFAULT": "#301820"\n                    }\n                  }\n                }\n              }\n            }\n          }\n        },\n        "x": 20,\n        "y": 114\n      }\n    ]\n  }\n}\n';
