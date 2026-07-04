import {http, HttpResponse} from 'msw';

import {registerMockFixture} from './fixtures';

import bootstrapSections from '../dashboard/sections/__fixtures__/bootstrap-sections.json';
import sectionMergedScriptless from '../dashboard/sections/__fixtures__/section-merged-scriptless.json';

// Scenario key for the teacher-dashboard sections domain (TDF-MSW-03..06,
// scenario-registry.md). The teacher-dashboard package's dev shell (F0-T11)
// selects one of the tags below via `?scenario=<tag>`.
const LAB_KEY = 'teacher-dashboard';

const [scriptless, scripted, unitGroup] = bootstrapSections.sections;

// TDF-MSW-03 "Empty (no sections)".
registerMockFixture(
  {labKey: LAB_KEY, tag: 'sections-empty'},
  {
    path: '*/api/v1/teacher_dashboard/sections',
    respond: {sections: [], section_order: null},
  },
);

// TDF-MSW-04 "One section (no curriculum)" — the recorded scriptless section.
registerMockFixture(
  {labKey: LAB_KEY, tag: 'sections-one'},
  {
    path: '*/api/v1/teacher_dashboard/sections',
    respond: {sections: [scriptless], section_order: null},
  },
);

// TDF-MSW-05 "Many sections + custom order" — the recorded fixture verbatim
// (3 sections, non-null section_order).
registerMockFixture(
  {labKey: LAB_KEY, tag: 'sections-many-ordered'},
  {path: '*/api/v1/teacher_dashboard/sections', respond: bootstrapSections},
);

// TDF-MSW-06 "Active + archived mix" — minimally edited from the recorded
// fixture: the unit_group section's `hidden` flipped to true (all three
// recorded sections came back `hidden: false`; no F0-T1 recording covered an
// archived section).
registerMockFixture(
  {labKey: LAB_KEY, tag: 'sections-archived-mixed'},
  {
    path: '*/api/v1/teacher_dashboard/sections',
    respond: {
      sections: [scriptless, scripted, {...unitGroup, hidden: true}],
      section_order: null,
    },
  },
);

export const sectionsHandlers = [
  // GET /api/v1/teacher_dashboard/sections — default: the recorded bootstrap
  // fixture (3 sections, non-null order). Scenario tags above (registered via
  // registerMockFixture) are served ahead of this by the dispatcher.
  http.get('*/api/v1/teacher_dashboard/sections', () =>
    HttpResponse.json(bootstrapSections),
  ),

  // GET /dashboardapi/section/:sectionId — default: the recorded scriptless
  // merged-section fixture (api_controller.rb:229-233 merge).
  http.get('*/dashboardapi/section/:sectionId', () =>
    HttpResponse.json(sectionMergedScriptless),
  ),
];
