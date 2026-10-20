# Mounting a workspace

This part puts a Blockly workspace on the page and keeps it in step with a
Driver (`definitions.md`). It has three layers:

- `Agent`, which owns one injected workspace: it injects it, loads blocks
  into it, follows the Driver's theme, and tears it down;
- `BlocklyWorkspace`, the React component that makes an Agent for an
  element it renders;
- `BlocklyProvider`, a React context that lets several workspaces share one
  Driver.

"Inject" is Blockly's word for creating a workspace inside a DOM element
(`Blockly.inject`).

## Why it exists

A workspace's lifetime is not its Driver's. A lab may show several at once
(the editing workspace, previews of blocks in its instructions), mount and
unmount them as the student moves around, and switch themes while they are
open. The Driver owns what is registered; the Agent owns what is drawn. The
Agent reports to its Driver when its workspace appears and disappears
(DEF-29 to DEF-31), and the Driver tells every Agent when the theme
changes.

## The Agent

WS-1. `new Agent(driver, options, inline, hidden, embedded, container?)`
records its arguments, registers itself with the Driver
(`driver.initialize`, DEF-29) and starts listening for the Driver's
`ThemeChanged` event. It does not inject. `options` are Blockly's injection
options.

WS-2. `inline`, `hidden` and `embedded` are fixed at construction. `inline`
and `hidden` decide how the Driver files the workspace (DEF-29, DEF-30), and
`inline` also changes `load` (WS-10). Nothing reads `embedded`.

WS-3. Assigning a container (`agent.container = element` or
`agent.setContainer(element)`) injects the workspace into it if the Agent
had no container before. If it had one, the Agent calls `move()`, which does
nothing. So an Agent constructed with a container never injects, and an
injected workspace cannot be moved to another element.

WS-4. Injecting:

1. throws if there is no container, or if the workspace already exists;
2. loads Blockly's English messages, unless a locale is already loaded,
   which it judges by whether `Blockly.Msg.WORKSPACE_LABEL_MANY_STACKS` is
   defined (a field or lab may have set messages of its own without loading
   a locale);
3. for an inline Agent, creates a new `div` outside the document and
   injects there instead of into the container;
4. acquires a renderer from the Driver (DEF-35);
5. calls `Blockly.inject` with the given options, except that `renderer`,
   `theme` and `toolbox` are replaced by the acquired renderer's name, the
   Driver's current theme, and the Agent's toolbox converted by
   `buildToolbox` (DEF-42), or none;
6. records the theme's font size, resizes the workspace to its element, and
   calls `driver.onInject` (DEF-30);
7. emits `AgentEvent.Injected` with the workspace and the Driver's
   environment;
8. adds a workspace change listener that emits `AgentEvent.BlocklyEvent`
   with each Blockly event and the environment;
9. arranges to re-measure the blocks when web fonts arrive (WS-5).

WS-5. When `document.fonts` settles (`fonts.ready`), and again at every
`loadingdone` event, the Agent marks every field of every block in its
workspace dirty, queues each block to render, waits for the renders, and
resizes the workspace, provided the workspace is still the Agent's and still
rendered. A field measures itself once and keeps the measurement; a
workspace injected before its font loaded would otherwise keep the fallback
font's sizes. The flyout's blocks are not re-measured.

WS-6. On the Driver's `ThemeChanged` event, an injected Agent sets the
Driver's current theme on its workspace. If the new theme's font size
differs from the one it recorded, it then re-renders every block of the
workspace and of its flyout, flushes the queued renders, and reflows the
flyout. Blockly restyles colours on a theme change but keeps each block's
measured size.

WS-7. `agent.setToolbox(toolbox)` records the toolbox, which the next
injection uses. If the workspace is already injected, was injected with a
toolbox or flyout, and `toolbox` is defined, it also replaces the
workspace's toolbox with `buildToolbox(toolbox)`. Blockly cannot add a
toolbox to a workspace injected without one, so that case only records it.
Setting `undefined` removes nothing. A dynamic category in a toolbox set
after injection gets no callback (DEF-43 registers them at injection only).
`agent.getToolbox()` returns the recorded toolbox.

WS-8. `agent.workspace` is the workspace once injected, and `undefined`
before injection and after `deconstruct`.

WS-9. `agent.load(serialization)` throws if the workspace has not been
injected. Otherwise it loads the serialization with
`Blockly.serialization.workspaces.load`, which first clears the workspace.
For an Agent that is not inline, it then calls `agent.positionBlocks`, if
set, with the workspace, and resizes the workspace. `positionBlocks` is how
a lab arranges loaded blocks that carry no positions; the package's own
arrangement is in `layout.md`.

WS-10. For an inline Agent, `load` turns the workspace into a picture in the
container:

1. it moves every top block to (0, 0);
2. it appends the workspace's injection `div` to `document.body` and
   resizes the workspace, so that Blockly can measure it;
3. it copies the workspace's `svg` element into the container, replacing the
   container's contents; the copy has no background, border or main
   background rectangle, and is drawn `inline-block` and `relative`;
4. it sizes the copy to the workspace's blocks: the blocks' bounding box
   times the workspace scale, but at least 30 pixels each way;
5. it adds the injection `div`'s classes to the container, so that Blockly's
   CSS, which is scoped to those classes, styles the copy;
6. it removes the injection `div`.

The copy does not respond to input. The workspace itself lives on, out of
the document, until `deconstruct`.

WS-11. `agent.deconstruct()` stops listening for fonts, calls
`driver.uninitialize` (DEF-31), stops listening for theme changes, releases
focus (WS-12), disposes the workspace, and releases its renderer (DEF-35).
It does not deconstruct the Driver.

WS-12. Before disposing a workspace, `releaseFocus(workspace)` takes it and
its flyout's workspace out of Blockly's focus manager, flyout first. For
each that the manager knows, if the focused node belongs to it, focus first
moves to the workspace itself; then the workspace is unregistered.

Blockly forgets a focused node at unregistration only if it can find the
node in the workspace's DOM. With a block placed from an external flyout by
the keyboard (`flyout.md`) and still being moved when its workspace was
disposed, it could not, and kept a node that no longer existed; the next
press on any block then threw trying to focus it again, which cancelled the
drag. Moving focus to the workspace before unregistering leaves it nothing
to lose. Blockly clears the focus itself in the simpler cases tried: a
focused block disposed with its workspace, or one moved into the drag
layer.

WS-13. `Agent` implements `WorkspaceAgent` (DEF-29).

## The workspace component

WS-14. `<BlocklyWorkspace>` renders a `div`, or a `span` if `inline`, with
the class `blocklyWorkspace` from its CSS module, the `className` prop, and,
if `hidden`, the module's `hiddenWorkspace`. That element is the Agent's
container.

WS-15. On mount, the component makes one Agent. Its Driver is the
enclosing `BlocklyProvider`'s, if there is one (WS-26); otherwise a new
Driver built from the `environment` prop (or an empty object), the
`renderer` prop (or thrasos), the `theme` prop (or the default theme) and
the `plugins` prop. The Agent gets the `options`
prop and the `inline`, `hidden` and `embedded` flags. On unmount, the Agent
is deconstructed. Under React's StrictMode, which mounts, unmounts and
mounts again, the second mount makes a fresh Agent.

`options`, `renderer`, `plugins`, `environment`, `inline`, `hidden` and
`embedded` are read at mount only. Changing `inline` or `renderer`
afterwards logs an error; changing the others does nothing.

WS-16. Once its element exists, the component gives it to the Agent as the
container, which injects (WS-3).

WS-17. When the `blocks` prop changes, and at mount if it is given, the
component calls `driver.setBlocks(blocks)`. Inside a provider, it also calls
`driver.setBlocks` with the provider's blocks when they or the `toolbox`
prop change. Since a provider's Driver is shared, a workspace's own
`blocks` prop replaces the block list for every workspace in the provider.

WS-18. When the `toolbox` prop changes, and at mount, the component calls
`agent.setToolbox(toolbox)` (WS-7).

WS-19. When the `theme` prop changes to a defined value, the component calls
`driver.setTheme(theme)` (DEF-32). Inside a provider this changes the theme
of every workspace in it.

WS-20. When `startBlocks` changes, and once the workspace exists, the
component calls `agent.load(startBlocks)` (WS-9, WS-10). The
`positionBlocks` prop is the Agent's `positionBlocks`, kept current as the
prop changes.

WS-21. After injection the component sets `workspaceRef.current` to the
workspace and `javascriptGeneratorRef.current` to Blockly's
`javascriptGenerator`, resizes the workspace unless inline, and calls
`onInject(workspace, environment)`.

WS-22. The component calls `onChange(event, environment)` for every
`AgentEvent.BlocklyEvent` (WS-4).

WS-23. When its element changes size, the component resizes the workspace,
unless inline.

WS-24. The component imports `blockly/blocks`, which defines Blockly's own
blocks (`controls_if`, `text_print`, and so on), so a lab can use them
without registering them.

WS-25. The CSS module sets the workspace element to `flex: 1 1 100%`,
`height: 100%` and `overflow: hidden`, and is meant to hide a hidden
workspace with `display: none`. Two things stop it working outside this
package's own source:

- the package build writes the stylesheet to `dist/` but no built module
  imports it, so a consumer of `dist/` gets the class names and none of the
  rules;
- the hiding rule's selector is `.blocklyWorkspace .hiddenWorkspace`, which
  matches a hidden workspace _inside_ a workspace element, but both classes
  are on the same element.

The labs set their own size on the element through `className`, and none
uses `hidden`.

## Sharing a Driver

WS-26. `<BlocklyProvider>` holds one Driver for its lifetime, built at its
first render from its `environment`, `renderer`, `theme` and `plugins`
props, with the same defaults as WS-15. When its `blocks` prop changes it
sets the Driver's blocks (DEF-6). Later changes to its other props do
nothing. It provides a context of `{driver, blocks, environment, setTheme}`,
where `driver` is a React ref to the Driver and `setTheme(theme)` sets the
Driver's theme. It constructs a new Driver on every render and keeps only
the first; the others run their constructors (DEF-28), registering their
global plugins, and are dropped. It never deconstructs the Driver it keeps.

WS-27. `useBlocklyContext()` returns the context. Outside a provider it
returns `{setTheme}`, with a `setTheme` that does nothing. Its type
parameter types the result as an environment, not as the context.

WS-28. The workspaces in one provider share its Driver: its blocks,
plugins, theme and environment. The first of them that is neither inline
nor hidden is the main workspace (DEF-29).

WS-29. Keyboard navigation is Blockly's, which version 13 enables in core.
The package adds no shortcuts of its own; a workspace it injects answers
Blockly's `up`, `down`, `left`, `right`, `focus_toolbox` and move
shortcuts.

## Test vectors

WS-V1 (WS-4). With `Blockly.Msg` emptied and only
`BUTTON_LABEL_CLEAR = 'Clear'` set, injecting defines
`WORKSPACE_LABEL_MANY_STACKS` and leaves `BUTTON_LABEL_CLEAR` as `'Clear'`.

WS-V2 (WS-9). With `positionBlocks` set, loading into a workspace that is
not inline calls it once with the workspace; loading into an inline one
does not call it.

WS-V3 (WS-10). An inline load of one `text_print` block leaves the
container holding one `svg` whose width and height are those of the block,
and at least 30 pixels.

WS-V4 (WS-6). Switching from the default theme to one whose font size is 16
rather than 11 makes a loaded `text_print` block taller.

WS-V5 (WS-12). A block placed by the keyboard from an external flyout and
still being moved when its workspace unmounts leaves Blockly's focus manager
with no focused node. The case needs the flyout, so its test is in
`flyout.md`'s part.

## Not specified here

- What a `positionBlocks` does: `layout.md`.
- The themes besides the default: `themes.md`.
- Workspaces embedded in instructions: `markdown.md`; the external flyout:
  `flyout.md`.

## Open questions

1. WS-3: should `move()` move the workspace, or should the constructor's
   `container` and the second assignment go? As things stand, a container
   given to the constructor stops the workspace ever appearing.
2. WS-2: `embedded` is documented as "not meant to be modified" and does
   nothing. Should it make the workspace read-only, or go?
3. WS-7: should a toolbox set after injection register its dynamic
   categories, and should `undefined` remove the toolbox?
4. WS-10: an inline workspace with several top blocks draws them all at
   (0, 0), on top of one another. Lay them out, or allow one only?
5. WS-11, WS-15, WS-26: nothing deconstructs a Driver that
   `BlocklyWorkspace` or `BlocklyProvider` made, so its registrations
   outlive the component (DEF-20). Under StrictMode a provider cannot simply
   deconstruct in its cleanup, since its second mount reuses the Driver.
   Who should own the Driver's end?
6. WS-17: should a workspace's `blocks` prop add to a provider's blocks
   rather than replace them for every workspace?
7. WS-25: ship the stylesheet as the markdown, lab and music packages do
   (`vite-plugin-lib-inject-css`), and correct the hiding selector? Turning
   the rules on in the labs may change their layout.
8. WS-26: a Driver per render is a bug.
9. WS-27: should `useBlocklyContext<T>()` return `BlocklyContent<T>`?
10. WS-15: should changing a mount-only prop be an error for all of them,
    or for none?
