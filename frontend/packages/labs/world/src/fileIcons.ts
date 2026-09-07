// The icon each kind of file wears.
//
// ITS OWN MODULE, AND A LEAF, because two very different things need it and one
// of them cannot reach `config.ts`. The file browser and the tabs read it
// through the Codebridge config; the toolbox reads it for the headings over
// the rule and actor drawers (`blockly/domainBlocks`) — and `config.ts`
// imports `BlocklyFileEditor`, which imports `domainBlocks`, so a toolbox that
// reached back for the config would close a cycle. It did, and the cycle was
// not theoretical: `worldConfig` was still undefined when the headings were
// built, so they came out with no icon at all and the lint caught the import
// before anybody noticed the pictures were missing.
//
// One list, so a file's icon and the heading over its drawer cannot drift into
// being two different pictures for one idea.

/**
 * A file type's icon, in the shape `FontAwesomeV6Icon` and Codebridge take.
 *
 * `iconStyle` is Codebridge's union rather than a string: widened, this assigns
 * to its `fileIcons` map only as `string`, and the config stops type-checking
 * against the thing that draws it.
 */
export interface FileIcon {
  iconName: string;
  iconStyle: 'solid' | 'regular';
  isBrand: boolean;
}

const icon = (iconName: string): FileIcon => ({
  iconName,
  iconStyle: 'solid',
  isBrand: false,
});

export const FILE_ICONS = {
  world: icon('planet-ringed'),
  actor: icon('masks-theater'),
  effect: icon('wand-sparkles'),
  rule: icon('scroll'),
  map: icon('map'),
  anim: icon('film'),
  sheet: icon('table-cells'),
} as const satisfies Record<string, FileIcon>;
