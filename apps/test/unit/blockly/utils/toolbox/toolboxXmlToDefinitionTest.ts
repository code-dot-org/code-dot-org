import type * as BlocklyCore from 'blockly/core';

import type {NamedDynamicCategoryInfo} from '@cdo/apps/blockly/utils/toolbox/factories';
import {toolboxXmlToDefinition} from '@cdo/apps/blockly/utils/toolbox/toolboxXmlToDefinition';

import setBlocklyGlobal from '../../../../util/setupBlocklyGlobal';

type StaticCategoryInfo = BlocklyCore.utils.toolbox.StaticCategoryInfo;

setBlocklyGlobal();

const CATEGORY_XML = `<xml>
  <category name="Math">
    <block type="math_number"><field name="NUM">42</field></block>
    <block type="math_arithmetic"/>
  </category>
  <category name="Variables" custom="VARIABLE"/>
  <category name="Behaviors" custom="Behavior">
    <block type="math_number"/>
  </category>
</xml>`;

const FLYOUT_XML = `<xml>
  <block type="math_number"><field name="NUM">7</field></block>
</xml>`;

describe('toolboxXmlToDefinition', () => {
  it('converts a category toolbox', () => {
    const definition = toolboxXmlToDefinition(CATEGORY_XML);
    expect(definition?.kind).toBe('categoryToolbox');
    expect(definition?.contents).toHaveLength(3);

    const [math, variables, behaviors] = definition?.contents as [
      StaticCategoryInfo,
      NamedDynamicCategoryInfo,
      StaticCategoryInfo
    ];
    // id keys the toolbox-mode round trip: toolboxToWorkspaceBlocks drops
    // categories without one.
    expect(math).toMatchObject({kind: 'category', name: 'Math', id: 'Math'});
    expect(math.contents).toHaveLength(2);
    expect(math.contents[0]).toMatchObject({
      kind: 'block',
      type: 'math_number',
      fields: {NUM: 42},
    });
    expect(math.contents[1]).toMatchObject({
      kind: 'block',
      type: 'math_arithmetic',
    });

    expect(variables).toMatchObject({
      kind: 'category',
      name: 'Variables',
      id: 'Variables',
      custom: 'VARIABLE',
    });

    // A custom flyout with no DYNAMIC_CATEGORY_OPTIONS entry degrades to a
    // static category of its XML children.
    expect(behaviors).toMatchObject({
      kind: 'category',
      name: 'Behaviors',
      id: 'Behaviors',
    });
    expect('custom' in behaviors).toBe(false);
    expect(behaviors.contents).toHaveLength(1);
  });

  it('converts a flyout toolbox', () => {
    const definition = toolboxXmlToDefinition(FLYOUT_XML);
    expect(definition?.kind).toBe('flyoutToolbox');
    expect(definition?.contents).toHaveLength(1);
    expect(definition?.contents[0]).toMatchObject({
      kind: 'block',
      type: 'math_number',
      fields: {NUM: 7},
    });
  });

  it('returns undefined for unparseable XML', () => {
    expect(toolboxXmlToDefinition('<xml><block')).toBeUndefined();
  });

  it('returns undefined for an empty toolbox', () => {
    expect(toolboxXmlToDefinition('<xml></xml>')).toBeUndefined();
  });
});
