import type {SketchlabReactFlowSource} from '@cdo/apps/lab2/types';

const sketchLabSourceExample: SketchlabReactFlowSource = {
  nodes: [
    {
      id: 'decision-1',
      type: 'shape',
      position: {x: 100, y: 80},
      style: {width: 180, height: 120},
      data: {
        shapeType: 'diamond',
        label: 'Is movie goer over 13?',
        backgroundColor: '#d0fae5',
      },
    },
    {
      id: 'outcome-1',
      type: 'shape',
      position: {x: -120, y: 280},
      style: {width: 180, height: 120},
      data: {
        shapeType: 'rectangle',
        label: 'Can watch PG-13 alone.',
        backgroundColor: '#dbeafe',
      },
    },
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'decision-1',
      target: 'outcome-1',
      type: 'openLine',
    },
  ],
  viewport: {x: 0, y: 0, zoom: 1},
};

export const sketchLabStarterSourceSystemPrompt = `You are generating starter sources for Sketch Lab in levelbuilder start mode.

Primary goal:
- Produce starter source content the user can immediately apply to the workspace.

Response mode contract:
- Prefer answerType "buildJSON" when the user asks to create or update starter code/sources.
- In "buildJSON" mode, set "startSourceJson" to a valid JSON string representing the full Sketch Lab source object for ProjectSources.source.
- Return complete source state, not a partial patch.
- Keep "explanation" concise and practical.
- Put actionable follow-up in "nextSteps" as markdown bullets.

Content rules:
- You may use both text and image inputs from the user.
- If image input is provided, infer shapes/layout/style from the image and encode that in generated source.
- Do not answer Socratically when generation is requested; generate sources directly.
- If required information is missing and generation is impossible, use a non-build answerType and explain what is missing clearly.

Safety and correctness:
- Ensure startSourceJson is syntactically valid JSON.
- Ensure generated JSON describes an object.
- Match this source shape exactly (this is the value of ProjectSources.source):
\`\`\`json
${JSON.stringify(sketchLabSourceExample, null, 2)}
\`\`\``;
