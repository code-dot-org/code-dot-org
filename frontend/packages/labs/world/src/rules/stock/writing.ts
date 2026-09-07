// "Shows Text" — the state a drawn word is drawn from.
//
// NAMED "Writing" AND NOT "Text". A rule's name is its toolbox category, and
// the toolbox already has a Text category — Blockly's, holding the string
// literal and the note block. Two categories with one name is a toolbox a
// learner has to read twice, so the rule takes the mechanic's name the way
// Physics, Collection and Shooting do, and leaves the word "text" to the
// property it is about.
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

/** The `rules/writing.rule` workspace. GENERATED — edit scripts/rules/writing.mjs. */
export const writingRule =
  '{\n  "blocks": {\n    "languageVersion": 0,\n    "blocks": [\n      {\n        "type": "world_rule",\n        "fields": {\n          "NAME": "Writing",\n          "ABILITY": "Shows Text"\n        },\n        "next": {\n          "block": {\n            "type": "world_doc",\n            "fields": {\n              "DOC": "**Writing** is the words an actor has to say.\\n\\nIt owns the *text* and draws none of it \\u2014 a Label actor does the drawing, which\\nis why the same words can be a speech bubble, a score line or a sign.\\n\\nGive anything with words **Shows Text**."\n            }\n          }\n        },\n        "x": 20,\n        "y": 20\n      },\n      {\n        "type": "world_rule_trait",\n        "fields": {\n          "NAME": "Shows Text"\n        },\n        "next": {\n          "block": {\n            "type": "world_rule_property",\n            "fields": {\n              "TYPE": "string",\n              "ACCESS": "writable",\n              "NAME": "text",\n              "DEFAULT": ""\n            },\n            "next": {\n              "block": {\n                "type": "world_rule_property",\n                "fields": {\n                  "TYPE": "number",\n                  "ACCESS": "writable",\n                  "NAME": "text size",\n                  "DEFAULT": "12"\n                },\n                "next": {\n                  "block": {\n                    "type": "world_rule_property",\n                    "fields": {\n                      "TYPE": "color",\n                      "ACCESS": "writable",\n                      "NAME": "text color",\n                      "DEFAULT": "#ffffff"\n                    },\n                    "next": {\n                      "block": {\n                        "type": "world_rule_property",\n                        "fields": {\n                          "TYPE": "string",\n                          "ACCESS": "writable",\n                          "NAME": "text anchor",\n                          "DEFAULT": "center"\n                        },\n                        "next": {\n                          "block": {\n                            "type": "world_doc",\n                            "fields": {\n                              "DOC": "**The words, and how they look.** The rule owns the text and draws none of it.\\n\\nA Label actor reads these four properties and paints them, which is why the same words can be a speech bubble, a score line or a sign \\u2014 the drawing is the actor\'s business and the words are yours.\\n\\n`text` starts EMPTY, because an actor nobody has given words to has none: a Label placed and left alone draws nothing rather than the word \\"text\\". The size is in pixels, like every other size in the lab; only rates are in units per second.\\n\\nReveals Text writes `text` a few letters at a time, and every drawing already reading it keeps working without knowing anything changed."\n                            }\n                          }\n                        }\n                      }\n                    }\n                  }\n                }\n              }\n            }\n          }\n        },\n        "x": 20,\n        "y": 342\n      }\n    ]\n  }\n}\n';
