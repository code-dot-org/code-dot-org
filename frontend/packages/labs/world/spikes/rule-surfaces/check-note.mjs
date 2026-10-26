// A page of prose on a block, drawn as markdown.
//
// Two things jsdom cannot answer, and they are the whole of the risk in this.
//
// HTML INSIDE SVG. A block is SVG and markdown is HTML, so the drawing lives
// in a `foreignObject` — and the height of wrapped prose is not knowable until
// a browser has laid it out. Blockly lays a block out from a size the FIELD
// reports, and the base field measures its own text and writes that over
// whatever the field set: the first attempt rendered the markdown perfectly
// and produced a block thirty-four pixels tall. So `FieldMarkdown` overrides
// `updateSize_`, and this checks that the block is as tall as its prose.
//
// AND THE WAY IN. A press anywhere on the prose opens the editor, through the
// same module-level opener the pencil uses.
//
//   yarn dev:isolated          # in another terminal
//   node spikes/rule-surfaces/check-note.mjs
import {chromium} from 'playwright';

const b = await chromium.launch();
const p = await b.newPage();
const errors = [];
p.on('pageerror', e => errors.push(e.message.slice(0, 160)));
await p.goto('http://localhost:5139/', {waitUntil: 'networkidle'});
await p.waitForTimeout(9000);
await p.getByRole('button', {name: 'Rules'}).first().click();
await p.waitForTimeout(1200);
await p
  .getByRole('menuitem')
  .filter({hasText: /^Solid Bodies/})
  .first()
  .click();
await p.waitForTimeout(5000);

const out = await p.evaluate(async () => {
  const {Blockly} = await import('/spikes/rule-surfaces/harness.ts');
  const workspace = Blockly.getMainWorkspace();
  const block = workspace.newBlock('world_doc');
  block.initSvg();
  // CHAINED ONTO THE RULE, not left floating. A top-level block with a
  // previous connection is an orphan, and `DisableOrphansPlugin` draws a
  // disabled block greyed — which reads exactly like prose that has not
  // picked up the theme, and cost an afternoon looking for a stylesheet that
  // was fine.
  const rule = workspace.getTopBlocks(true).find(x => x.type === 'world_rule');
  let last = rule;
  while (last.getNextBlock()) {
    last = last.getNextBlock();
  }
  last.nextConnection.connect(block.previousConnection);
  block.setFieldValue(
    '# Solid Bodies\n\nPushes a body **out** of anything solid.\n\n' +
      '- sideways first\n- then up or down\n',
    'DOC',
  );
  block.queueRender();
  Blockly.renderManagement.triggerQueuedRenders();
  await new Promise(done => setTimeout(done, 800));

  const foreign = block.getSvgRoot().querySelector('foreignObject');
  const prose = foreign?.firstElementChild;
  const size = block.getHeightWidth();

  // The press that opens the editor, on the transparent overlay that takes it.
  block
    .getSvgRoot()
    .querySelector('rect[fill="transparent"]')
    ?.dispatchEvent(
      new PointerEvent('pointerdown', {bubbles: true, cancelable: true}),
    );
  await new Promise(done => setTimeout(done, 600));

  return {
    block: {height: Math.round(size.height), width: Math.round(size.width)},
    prose: Math.round(Number(foreign?.getAttribute('height') ?? 0)),
    // Rendered, not escaped: a heading is a heading and bold is bold.
    heading: prose?.querySelector('h1')?.textContent ?? null,
    bold: prose?.querySelector('strong')?.textContent ?? null,
    items: prose?.querySelectorAll('li').length ?? 0,
    // Enabled, or the drawing below is a disabled block's grey rather than
    // the theme's own colours.
    enabled: block.isEnabled(),
    // The prose sits on the theme's background, framed by the block.
    background: prose ? getComputedStyle(prose).backgroundColor : null,
    colour: prose ? getComputedStyle(prose).color : null,
    editor: Boolean(
      document.querySelector('textarea[aria-label="Markdown source"]'),
    ),
  };
});
out.errors = errors.slice(0, 4);

// Expected: a heading of "Solid Bodies", a bold "out", two list items; the
// block TALLER than the prose it holds rather than the 34px a default field
// reports; the prose on white with dark text, which is the theme's background
// rather than the block's colour; and the editor open.
console.log(JSON.stringify(out, null, 1));
await b.close();
