import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';
import React from 'react';

import {pathwaySourceSchema} from '@cdo/apps/adaptive/schema';
import SchemaForm from '@cdo/apps/lab2/levelEditors/schemaForm/SchemaForm';
import {kindOf} from '@cdo/apps/lab2/levelEditors/schemaForm/schemaNodes';

// The schema form works for any Lab2 schema: it draws the adaptive pathway
// schema, which was not written for a form, and leaves the value unchanged.
const PATHWAY = path.resolve(
  __dirname,
  '../../../../../../dashboard/config/level_content/adaptive/ai-makerspace-2026.json'
);

describe('the schema form on the adaptive pathway schema', () => {
  it('draws the AI Makerspace pathway without changing it', () => {
    const pathway = JSON.parse(fs.readFileSync(PATHWAY, 'utf8'));
    expect(pathwaySourceSchema.safeParse(pathway).success).toBe(true);
    const onChange = jest.fn();
    render(
      <SchemaForm
        schema={pathwaySourceSchema}
        value={pathway}
        onChange={onChange}
      />
    );
    expect(screen.getByDisplayValue(pathway.title)).toBeInTheDocument();
    expect(screen.getByText('Format version')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('describes most of it with real controls, not JSON', () => {
    const kinds: Record<string, number> = {};
    const visit = (schema: unknown, depth: number) => {
      if (depth > 12) {
        return;
      }
      const s = schema as Parameters<typeof kindOf>[0];
      const kind = kindOf(s);
      kinds[kind] = (kinds[kind] ?? 0) + 1;
      const def = (s as unknown as {_zod: {def: Record<string, unknown>}})._zod
        .def;
      const inner =
        def.type === 'optional' ? (def.innerType as typeof s) : (s as typeof s);
      const innerDef = (
        inner as unknown as {_zod: {def: Record<string, unknown>}}
      )._zod.def;
      Object.values((innerDef.shape ?? {}) as Record<string, unknown>).forEach(
        child => visit(child, depth + 1)
      );
      if (innerDef.element) {
        visit(innerDef.element, depth + 1);
      }
      if (innerDef.valueType) {
        visit(innerDef.valueType, depth + 1);
      }
      ((innerDef.options ?? []) as unknown[]).forEach(option =>
        visit(option, depth + 1)
      );
    };
    visit(pathwaySourceSchema, 0);
    const total = Object.values(kinds).reduce((a, b) => a + b, 0);

    console.log(JSON.stringify(kinds));
    expect((kinds.json ?? 0) / total).toBeLessThan(0.1);
  });
});
