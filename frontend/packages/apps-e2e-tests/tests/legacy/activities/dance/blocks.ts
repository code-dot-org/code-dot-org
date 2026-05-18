/**
 * Blockly workspace JSON fixtures for Dance Party (dance course, lesson 1).
 *
 * Source: `I've initialized the workspace with winning dance level 8 blocks`
 * in dashboard/test/ui/features/step_definitions/blockly_initialization_blocks.rb.
 *
 * Sets up 4 dancers with a tropical-sparkles background, then at measure 4
 * applies ClapHigh/Drop moves and a #33ffff tint. Passes level 8's set-tint
 * block requirement.
 *
 * Pass to Dance.loadBlocks() (inherited from LegacyBlocklyLab).
 */

const danceLevel8Workspace = {
  variables: [
    {name: 'top_dancer1', id: '/8*8Da@SKEsL`z#ui!lB'},
    {name: 'top_dancer2', id: 'fqo+,9mYPu*)gzS;nFVD'},
    {name: 'bottom_dancer1', id: '+~v9SL5a8O+`MZw+*U,v'},
    {name: 'bottom_dancer2', id: 'ESE[D6*G_|Q9Og@$^dt*'},
  ],
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'Dancelab_whenSetup',
        x: 16,
        y: 16,
        inputs: {
          DO: {
            block: {
              type: 'Dancelab_setBackgroundEffectWithPalette',
              fields: {
                PALETTE: '<field name="PALETTE">"tropical"</field>',
                EFFECT: '<field name="EFFECT">"sparkles"</field>',
              },
              next: {
                block: {
                  type: 'Dancelab_makeNewDanceSprite',
                  fields: {
                    COSTUME:
                      '<field name="COSTUME" config="&quot;ALIEN&quot;, &quot;BEAR&quot;, &quot;CAT&quot;, &quot;DUCK&quot;, &quot;FROG&quot;, &quot;MOOSE&quot;, &quot;ROBOT&quot;, &quot;UNICORN&quot;">"BEAR"</field>',
                    NAME: {id: '/8*8Da@SKEsL`z#ui!lB'},
                    LOCATION: '<field name="LOCATION">{x: 100, y: 100}</field>',
                  },
                  next: {
                    block: {
                      type: 'Dancelab_makeNewDanceSprite',
                      fields: {
                        COSTUME:
                          '<field name="COSTUME" config="&quot;ALIEN&quot;, &quot;BEAR&quot;, &quot;CAT&quot;, &quot;DUCK&quot;, &quot;FROG&quot;, &quot;MOOSE&quot;, &quot;ROBOT&quot;, &quot;UNICORN&quot;">"FROG"</field>',
                        NAME: {id: 'fqo+,9mYPu*)gzS;nFVD'},
                        LOCATION:
                          '<field name="LOCATION">{x: 300, y: 100}</field>',
                      },
                      next: {
                        block: {
                          type: 'Dancelab_makeNewDanceSprite',
                          fields: {
                            COSTUME:
                              '<field name="COSTUME" config="&quot;ALIEN&quot;, &quot;BEAR&quot;, &quot;CAT&quot;, &quot;DUCK&quot;, &quot;FROG&quot;, &quot;MOOSE&quot;, &quot;ROBOT&quot;, &quot;UNICORN&quot;">"ROBOT"</field>',
                            NAME: {id: '+~v9SL5a8O+`MZw+*U,v'},
                            LOCATION:
                              '<field name="LOCATION">{x: 100, y: 300}</field>',
                          },
                          next: {
                            block: {
                              type: 'Dancelab_makeNewDanceSprite',
                              fields: {
                                COSTUME:
                                  '<field name="COSTUME" config="&quot;ALIEN&quot;, &quot;BEAR&quot;, &quot;CAT&quot;, &quot;DUCK&quot;, &quot;FROG&quot;, &quot;MOOSE&quot;, &quot;ROBOT&quot;, &quot;UNICORN&quot;">"UNICORN"</field>',
                                NAME: {id: 'ESE[D6*G_|Q9Og@$^dt*'},
                                LOCATION:
                                  '<field name="LOCATION">{x: 300, y: 300}</field>',
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        type: 'Dancelab_atTimestamp',
        x: 16,
        y: 360,
        fields: {
          TIMESTAMP: 4,
          UNIT: '<field name="UNIT">"measures"</field>',
        },
        next: {
          block: {
            type: 'Dancelab_changeMoveLR',
            fields: {
              SPRITE: {id: '/8*8Da@SKEsL`z#ui!lB'},
              MOVE: '<field name="MOVE">MOVES.ClapHigh</field>',
              DIR: '<field name="DIR">-1</field>',
            },
            next: {
              block: {
                type: 'Dancelab_changeMoveLR',
                fields: {
                  SPRITE: {id: 'fqo+,9mYPu*)gzS;nFVD'},
                  MOVE: '<field name="MOVE">MOVES.ClapHigh</field>',
                  DIR: '<field name="DIR">1</field>',
                },
                next: {
                  block: {
                    type: 'Dancelab_changeMoveLR',
                    fields: {
                      SPRITE: {id: '+~v9SL5a8O+`MZw+*U,v'},
                      MOVE: '<field name="MOVE">MOVES.Drop</field>',
                      DIR: '<field name="DIR">-1</field>',
                    },
                    next: {
                      block: {
                        type: 'Dancelab_changeMoveLR',
                        id: 'bottomChangeMove',
                        fields: {
                          SPRITE: {id: 'ESE[D6*G_|Q9Og@$^dt*'},
                          MOVE: '<field name="MOVE">MOVES.Drop</field>',
                          DIR: '<field name="DIR">1</field>',
                        },
                        next: {
                          block: {
                            type: 'Dancelab_setTintInline',
                            id: 'setTint',
                            fields: {
                              SPRITE: {id: '/8*8Da@SKEsL`z#ui!lB'},
                              VAL: '#33ffff',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ],
  },
};

export const WINNING_DANCE_LEVEL_8_BLOCKS = danceLevel8Workspace;
