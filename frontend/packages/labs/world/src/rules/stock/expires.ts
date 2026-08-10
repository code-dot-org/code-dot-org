// "Expires" — a thing that takes itself out of the world after a while.
//
// The other half of spawning. `add actor` puts something in, and without this
// nothing ever takes it out: bullets fly off the edge and keep flying, and in a
// world that wraps they come back round and orbit forever. A game that fires
// six shots a second and never removes one is a game that gets slower the
// longer it is played, which is a bug that looks like bad performance rather
// than like a missing block.
//
// A TRAIT rather than something `add actor` does, because how long a thing
// should last is a fact about the KIND of thing: a bullet lasts two seconds, a
// spark a quarter of one, a dropped coin until somebody takes it. Electing it
// is also how an actor says it is temporary at all — most are not, and a
// lifetime nobody asked for would quietly delete the player.
//
// It reads `age`, which the world stamps at placement, rather than counting
// down a number of its own. Two things follow. Nothing has to be written each
// frame, so this costs one comparison per actor and no state at all; and an
// actor spawned mid-game is measured from when it appeared rather than from
// when the game began, which is the only reading that makes sense for something
// that was not there at the start.
//
// It runs in `react`, after `touch` has worked out what is against what and
// `settle` has pushed bodies apart. That ordering is the point: a bullet whose
// last frame is also the frame it hits something still gets to hit it. Removing
// in `adjust` would delete it before the collision was noticed, and the shot
// that killed the asteroid would miss for no visible reason.
//
// Removal is not immediate — `World.tick` sweeps what is leaving after the
// handlers have run — so a handler responding to the same frame's collision
// still finds the actor there. That is the engine's behaviour, not this rule's,
// and it is what makes "hit something and expire on the same frame" safe.

/** The `rules/expires.rule` workspace. GENERATED — edit scripts/rules/expires.mjs. */
export const expiresRule =
  '{\n  "blocks": {\n    "languageVersion": 0,\n    "blocks": [\n      {\n        "type": "world_rule",\n        "fields": {\n          "NAME": "Expiry",\n          "ABILITY": "Expires"\n        },\n        "next": {\n          "block": {\n            "type": "world_use_rule",\n            "fields": {\n              "RULE": "Space"\n            }\n          }\n        },\n        "x": 20,\n        "y": 20\n      },\n      {\n        "type": "world_rule_trait",\n        "fields": {\n          "NAME": "Expires"\n        },\n        "next": {\n          "block": {\n            "type": "world_rule_property",\n            "fields": {\n              "TYPE": "number",\n              "ACCESS": "writable",\n              "NAME": "lifetime",\n              "DEFAULT": "2"\n            },\n            "next": {\n              "block": {\n                "type": "world_trait_step",\n                "fields": {\n                  "PHASE": "react",\n                  "NAME": "run out"\n                },\n                "inputs": {\n                  "DO": {\n                    "block": {\n                      "type": "world_comment",\n                      "fields": {\n                        "TEXT": "Older than it was meant to last? Then it is done."\n                      },\n                      "next": {\n                        "block": {\n                          "type": "world_comment",\n                          "fields": {\n                            "TEXT": "MORE than, not at least: a lifetime of 0 would delete it on the frame it appeared."\n                          },\n                          "next": {\n                            "block": {\n                              "type": "controls_if",\n                              "inputs": {\n                                "IF0": {\n                                  "block": {\n                                    "type": "logic_compare",\n                                    "fields": {\n                                      "OP": "GT"\n                                    },\n                                    "inputs": {\n                                      "A": {\n                                        "block": {\n                                          "type": "world_actor_age",\n                                          "inputs": {\n                                            "ACTOR": {\n                                              "block": {\n                                                "type": "world_this_actor"\n                                              }\n                                            }\n                                          }\n                                        }\n                                      },\n                                      "B": {\n                                        "block": {\n                                          "type": "world_get_Expiry_LifetimeProperty",\n                                          "inputs": {\n                                            "ACTOR": {\n                                              "block": {\n                                                "type": "world_this_actor"\n                                              }\n                                            }\n                                          }\n                                        }\n                                      }\n                                    }\n                                  }\n                                },\n                                "DO0": {\n                                  "block": {\n                                    "type": "world_remove_actor",\n                                    "inputs": {\n                                      "ACTOR": {\n                                        "block": {\n                                          "type": "world_this_actor"\n                                        }\n                                      }\n                                    }\n                                  }\n                                }\n                              }\n                            }\n                          }\n                        }\n                      }\n                    }\n                  }\n                }\n              }\n            }\n          }\n        },\n        "x": 20,\n        "y": 148\n      }\n    ]\n  }\n}\n';
