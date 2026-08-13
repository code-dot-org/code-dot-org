// "Shows Text" — the state a drawn word is drawn from.
//
// A RULE WITH NO STEPS, which nothing else here is. Nothing about text happens
// over time: this declares what an actor's words are and leaves the drawing to
// the actor that elects it (specs/DRAWING.md). It exists to be elected and to
// be set.
//
// WHY THESE ARE A TRAIT'S AND NOT THE ACTOR'S OWN. `define property` in an
// `.actor` file would say the same thing in one file instead of two, and the
// getter and setter it mints would be in that file's palette and NOWHERE ELSE
// (`BlocklyFileEditor` hands the palette only the actor being edited). A
// world's handler could never say `set text of ⟨any ⟨Score⟩⟩`, which is the
// entire point of having a score. A rule's property has no such limit.
//
// Electing it is also what makes labels findable: `for each actor where ⟨has
// trait ⟨Shows Text⟩⟩` is a sentence, with nothing new behind it.

/** The `rules/text.rule` workspace. GENERATED — edit scripts/rules/text.mjs. */
export const textRule =
  '{\n  "blocks": {\n    "languageVersion": 0,\n    "blocks": [\n      {\n        "type": "world_rule",\n        "fields": {\n          "NAME": "Text",\n          "ABILITY": "Shows Text"\n        },\n        "x": 20,\n        "y": 20\n      },\n      {\n        "type": "world_rule_trait",\n        "fields": {\n          "NAME": "Shows Text"\n        },\n        "next": {\n          "block": {\n            "type": "world_rule_property",\n            "fields": {\n              "TYPE": "string",\n              "ACCESS": "writable",\n              "NAME": "text",\n              "DEFAULT": ""\n            },\n            "next": {\n              "block": {\n                "type": "world_rule_property",\n                "fields": {\n                  "TYPE": "number",\n                  "ACCESS": "writable",\n                  "NAME": "text size",\n                  "DEFAULT": "12"\n                },\n                "next": {\n                  "block": {\n                    "type": "world_rule_property",\n                    "fields": {\n                      "TYPE": "string",\n                      "ACCESS": "writable",\n                      "NAME": "text color",\n                      "DEFAULT": "#ffffff"\n                    },\n                    "next": {\n                      "block": {\n                        "type": "world_rule_property",\n                        "fields": {\n                          "TYPE": "string",\n                          "ACCESS": "writable",\n                          "NAME": "text anchor",\n                          "DEFAULT": "centre"\n                        }\n                      }\n                    }\n                  }\n                }\n              }\n            }\n          }\n        },\n        "x": 20,\n        "y": 114\n      }\n    ]\n  }\n}\n';
