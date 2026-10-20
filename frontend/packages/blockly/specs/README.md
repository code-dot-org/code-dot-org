# Specifications

One document per part of the package. Each says what its part is for, how
it behaves, and why it is built that way, closely enough that a change of
behaviour is a change to the document.

The package is landing in parts, in the order below, each with its
document. A part's code, tests and document change together.

## Reading a document

A requirement is a numbered paragraph, `DEF-12` for the twelfth of
`definitions.md`. The test that checks a requirement names it at the start
of its title (`it('DEF-12: ...')`), so a behaviour can be followed from the
document to its test to the code.

Each document ends with test vectors (worked examples with exact values),
what it deliberately leaves to other documents, and open questions. An open
question is a decision not yet made; until it is, the requirement describes
what the code does, even where that is wrong.

## The parts

| Part | Document             | Prefix | Contents                                                                 | Needs  | Status  |
| ---- | -------------------- | ------ | ------------------------------------------------------------------------ | ------ | ------- |
| 1a   | `definitions.md`     | DEF-   | definitions, Driver, Registry, plugins, renderer, toolbox, default theme | —      | written |
| 1b   | `workspace.md`       | WS-    | Agent, contexts, `BlocklyWorkspace`, demo                                | 1a     | written |
| 2    | `themes.md`          | THM-   | the other nine themes                                                    | 1a     | written |
| 3    | `inputs.md`          | INP-   | the rectangle, round and triangle notch shapes                           | 1a     | written |
| 4    | `react-fields.md`    | RF-    | `createReactField`, field utilities                                      | 1b     | written |
| 5    | `fields.md`          | FLD-   | the dropdown field                                                       | 1a     | written |
| 6    | `fields.md`          | FLD-   | the colour and button fields                                             | 1a     | written |
| 7    | `common-blocks.md`   | CMN-   | `BaseBlocks`                                                             | 5, 6   | written |
| 8    | `procedures.md`      | PRC-   | shareable procedures, procedure mutators                                 | 1a     | written |
| 9    | `layout.md`          | LAY-   | positioning blocks on load                                               | 1b, 8  | written |
| 10   | `plugins.md`         | PLG-   | scrolling, `TopLeftMetricsManager`                                       | 1b     | planned |
| 11   | `plugins.md`         | PLG-   | the toolbox trashcan                                                     | 1b     | planned |
| 12   | `plugins.md`         | PLG-   | block limits, disabled orphans, gray undeletables                        | 1b     | planned |
| 13   | `xml-toolbox.md`     | XML-   | XML to JSON, toolbox and code utilities                                  | 1a     | planned |
| 14   | `typed-variables.md` | TV-    | `createTypedVariable`                                                    | 1a     | planned |
| 15   | `flyout.md`          | FLY-   | `BlocklyFlyout`                                                          | 1b     | planned |
| 16   | `markdown.md`        | MD-    | blocks embedded in markdown                                              | 1b, 13 | planned |
| 17   | `mini-toolbox.md`    | MT-    | the mini-toolbox field                                                   | 1b, 6  | planned |

The labs in the `ngfp` stack need parts 1a through 11, and the
`toolboxToWorkspaceBlocks` utility of part 13. Parts 2, 3, 4 and 5 depend
only on 1a or 1b and can be reviewed side by side.

## Departures from `ngfp/blockly`

The package first existed whole, on the `ngfp/blockly` branch. The parts
are cut from it; the code is the same except where this list says
otherwise. When the last part lands, the package is `ngfp/blockly` with
these changes.

1. The kernel registers no procedure blocks. `ngfp/blockly`'s Registry
   replaced Blockly's procedure blocks with those of
   `@blockly/block-shareable-procedures` on every registration; that is
   what the `sharableProcedures` plugin already does, and it becomes the
   only way (part 8). A lab that uses procedure blocks, as Music does,
   must add the plugin. The `ProcedureBlock` and `LegacyProcedureBlock`
   types move to part 8 with it.
2. The Driver depends on the `WorkspaceAgent` interface, the four members
   it reads, instead of on `Agent`. This is what lets part 1a stand without
   part 1b.
3. `isDarkTheme` moves to `themes/isDarkTheme.ts`, so the renderer need not
   load every theme to ask whether one is dark. `themes/index.ts` (part 2)
   re-exports it.
4. The package follows `frontend/docs/conventions/packages.md` where it
   cheaply can: version `0.0.0`; no `"type": "module"`, so the ESLint
   configuration is `eslint.config.mjs`; `build.emptyOutDir: false` and a
   `clean` script. It declares `events` and `@vitejs/plugin-react`, which
   it imports but did not declare. Each part brings only the dependencies its code uses.
   `copy.mjs`, which nothing runs, is not carried over.
5. The renderer computes dark-theme secondary colours for the theme being
   set. `ngfp/blockly` computed them for the theme before it, so a
   workspace that started dark had Blockly's colours, and one switched from
   dark to light had the darkened ones. See `definitions.md`, DEF-38.
6. `Agent.load` arranges loaded blocks through a `positionBlocks` hook,
   which `BlocklyWorkspace` takes as a prop, instead of calling the
   collision layout itself. The workspace part does not depend on the layout
   part. Part 9 makes the collision layout the prop's default, which restores
   `ngfp/blockly`'s behaviour for labs that pass nothing.
7. The demo starts as one workspace over Blockly's own blocks. The lesson
   modes, theme menu and instructions panel of `ngfp/blockly`'s demo return
   with the parts they show.
8. `BlocklyProvider` constructs its Driver once. `ngfp/blockly` constructed
   one on every render and kept the first, so every render of a lab under
   `lab-base`'s `BlocklyLab` ran a Driver constructor and initialized the
   global plugins again. See `workspace.md`, WS-26.
9. The default themes define `ai_blocks`, which apps' do and
   `ngfp/blockly`'s did not, and the `Theme` type requires it and
   `comment_blocks`. See `themes.md`, THM-6.
10. `tritanopia-dark` is labelled "Tritanopia Dark Theme"; `ngfp/blockly`'s
    inherited `default-dark`'s label, "Modern Dark Theme".
11. The dropdown draws right-to-left text as apps' does, between override
    and pop-directional marks. See `fields.md`, FLD-9.
12. `BaseBlocks`' stock entries carry every method of Blockly's
    definition (CMN-11). `ngfp/blockly` kept only `init`, so the fourteen
    stock blocks with more (`lists_create_with`, `lists_getIndex`, the
    procedure blocks, `text_prompt` and others) lost their extra state or
    failed to build once registered through a Driver.
13. The procedures plugin registers the library's procedure serializer
    (PRC-4), as apps does. `ngfp/blockly` registered none, so a
    definition's parameters were lost when a workspace was saved as JSON.
