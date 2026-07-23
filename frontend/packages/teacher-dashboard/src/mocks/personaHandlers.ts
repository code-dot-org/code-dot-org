// Per-persona MSW route sets. Each persona overrides shared homepage handlers
// where its data diverges from the defaults.

import {HttpResponse} from 'msw';

import type {
  MockRoute,
  MockResponderContext,
} from '@code-dot-org/core/api/mocks';

import {PERSONAS, type PersonaTag} from './personas';

// Lesson lists keyed by unit_id. The first entry per list is the unit overview
// (value has no /lessons/), the rest are individual lessons.
type LessonEntry = {text: string; value: string};
const LESSONS_BY_UNIT: Record<number, LessonEntry[]> = {
  // CSF Course A
  1001: [
    {
      text: 'Course A: Sequencing',
      value: '/teacher_dashboard/sections/:sectionId/courses/csf-2024/units/1',
    },
    {
      text: 'Lesson 1: Unplugged - Happy Maps',
      value: '/s/coursea-2024/lessons/1/levels/1',
    },
    {
      text: 'Lesson 2: Move It, Move It',
      value: '/s/coursea-2024/lessons/2/levels/1',
    },
    {
      text: 'Lesson 3: Jigsaw - Learn to Drag and Drop',
      value: '/s/coursea-2024/lessons/3/levels/1',
    },
    {
      text: 'Lesson 4: Maze - Sequence',
      value: '/s/coursea-2024/lessons/4/levels/1',
    },
    {
      text: 'Lesson 5: Looking Ahead with Minecraft',
      value: '/s/coursea-2024/lessons/5/levels/1',
    },
    {
      text: 'Lesson 6: Programming with Harvester',
      value: '/s/coursea-2024/lessons/6/levels/1',
    },
  ],
  // CSF Course B
  1002: [
    {
      text: 'Course B: Loops',
      value: '/teacher_dashboard/sections/:sectionId/courses/csf-2024/units/2',
    },
    {
      text: 'Lesson 1: Unplugged - My Robotic Friends',
      value: '/s/courseb-2024/lessons/1/levels/1',
    },
    {
      text: 'Lesson 2: Collecting Treasure with Laurel',
      value: '/s/courseb-2024/lessons/2/levels/1',
    },
    {
      text: 'Lesson 3: Loops with REP',
      value: '/s/courseb-2024/lessons/3/levels/1',
    },
    {
      text: 'Lesson 4: Loops with Anna and Elsa',
      value: '/s/courseb-2024/lessons/4/levels/1',
    },
  ],
  // CSD Problem Solving and Computing
  2001: [
    {
      text: 'Problem Solving and Computing',
      value: '/teacher_dashboard/sections/:sectionId/courses/csd-2024/units/1',
    },
    {
      text: 'Lesson 1: Computer Science is Changing Everything',
      value: '/s/csd3-2024/lessons/1/levels/1',
    },
    {
      text: 'Lesson 2: The Problem Solving Process',
      value: '/s/csd3-2024/lessons/2/levels/1',
    },
    {
      text: 'Lesson 3: Exploring Technology',
      value: '/s/csd3-2024/lessons/3/levels/1',
    },
    {
      text: 'Lesson 4: Input and Output',
      value: '/s/csd3-2024/lessons/4/levels/1',
    },
    {
      text: 'Lesson 5: The Need for Addressing',
      value: '/s/csd3-2024/lessons/5/levels/1',
    },
  ],
  // CSD Web Development
  2002: [
    {
      text: 'Web Development',
      value: '/teacher_dashboard/sections/:sectionId/courses/csd-2024/units/2',
    },
    {text: 'Lesson 1: Intro to HTML', value: '/s/csd4-2024/lessons/1/levels/1'},
    {
      text: 'Lesson 2: Headings and Lists',
      value: '/s/csd4-2024/lessons/2/levels/1',
    },
    {text: 'Lesson 3: CSS Styling', value: '/s/csd4-2024/lessons/3/levels/1'},
    {
      text: 'Lesson 4: Images and Links',
      value: '/s/csd4-2024/lessons/4/levels/1',
    },
    {
      text: 'Lesson 5: Responsive Design',
      value: '/s/csd4-2024/lessons/5/levels/1',
    },
    {
      text: 'Lesson 6: Project - Personal Website',
      value: '/s/csd4-2024/lessons/6/levels/1',
    },
  ],
  // CSP Digital Information
  3001: [
    {
      text: 'Digital Information',
      value: '/teacher_dashboard/sections/:sectionId/courses/csp-2024/units/1',
    },
    {
      text: 'Lesson 1: Welcome to CSP',
      value: '/s/csp1-2024/lessons/1/levels/1',
    },
    {
      text: 'Lesson 2: Representing Information',
      value: '/s/csp1-2024/lessons/2/levels/1',
    },
    {
      text: 'Lesson 3: Circle Square Patterns',
      value: '/s/csp1-2024/lessons/3/levels/1',
    },
    {
      text: 'Lesson 4: Binary Numbers',
      value: '/s/csp1-2024/lessons/4/levels/1',
    },
    {
      text: 'Lesson 5: Overflow and Rounding',
      value: '/s/csp1-2024/lessons/5/levels/1',
    },
  ],
  // CSP The Internet
  3002: [
    {
      text: 'The Internet',
      value: '/teacher_dashboard/sections/:sectionId/courses/csp-2024/units/2',
    },
    {
      text: 'Lesson 1: Welcome to the Internet',
      value: '/s/csp2-2024/lessons/1/levels/1',
    },
    {
      text: 'Lesson 2: Building a Network',
      value: '/s/csp2-2024/lessons/2/levels/1',
    },
    {
      text: 'Lesson 3: The Internet Is a System',
      value: '/s/csp2-2024/lessons/3/levels/1',
    },
    {
      text: 'Lesson 4: Packets and Protocols',
      value: '/s/csp2-2024/lessons/4/levels/1',
    },
  ],
  // CSA Object-Oriented Programming
  4001: [
    {
      text: 'Object-Oriented Programming',
      value: '/teacher_dashboard/sections/:sectionId/courses/csa-2024/units/1',
    },
    {
      text: 'Lesson 1: Classes and Objects',
      value: '/s/csa1-2024/lessons/1/levels/1',
    },
    {
      text: 'Lesson 2: Creating Objects',
      value: '/s/csa1-2024/lessons/2/levels/1',
    },
    {
      text: 'Lesson 3: Calling Methods',
      value: '/s/csa1-2024/lessons/3/levels/1',
    },
    {
      text: 'Lesson 4: Writing Methods',
      value: '/s/csa1-2024/lessons/4/levels/1',
    },
    {text: 'Lesson 5: Constructors', value: '/s/csa1-2024/lessons/5/levels/1'},
    {
      text: 'Lesson 6: Project - Theater',
      value: '/s/csa1-2024/lessons/6/levels/1',
    },
  ],
};

function lessonsForSection(
  sectionId: number,
  sections: {id: number; unit_id?: number | null}[],
): LessonEntry[] {
  const section = sections.find(s => s.id === sectionId);
  if (!section?.unit_id) return [];
  const template = LESSONS_BY_UNIT[section.unit_id];
  if (!template) return [];
  // Replace :sectionId placeholder with the actual section id.
  return template.map(entry => ({
    ...entry,
    value: entry.value.replace(':sectionId', String(sectionId)),
  }));
}

function routesForPersona(tag: PersonaTag): MockRoute[] {
  const persona = PERSONAS[tag];
  const routes: MockRoute[] = [
    // Primary section list — the homepage's main data source.
    {
      method: 'get',
      path: '*/dashboardapi/sections',
      respond: persona.sections,
    },
    // Course offerings catalog.
    ...(tag === 'degraded'
      ? [
          {
            method: 'get' as const,
            path: '*/dashboardapi/sections/valid_course_offerings',
            respond: () =>
              HttpResponse.json(
                {error: 'Internal Server Error'},
                {status: 500},
              ),
          },
        ]
      : [
          {
            method: 'get' as const,
            path: '*/dashboardapi/sections/valid_course_offerings',
            respond: persona.courseOfferings,
          },
        ]),
    // Available participant types.
    {
      method: 'get',
      path: '*/dashboardapi/sections/available_participant_types',
      respond: {availableParticipantTypes: persona.availableParticipantTypes},
    },
    // Lesson dropdown for sections with an assigned unit.
    {
      method: 'get',
      path: '*/sections/:sectionId/retrieve_lessons_for_dropdown',
      respond: ({params}: MockResponderContext) => {
        const id = Number(params.sectionId);
        return lessonsForSection(id, persona.sections);
      },
    },
    // Coteacher invites.
    {
      method: 'get',
      path: '*/api/v1/section_instructors',
      respond: persona.extras.coteacherInvites,
    },
    // Teaching profile data (personalization quiz state).
    {
      method: 'get',
      path: '*/teaching_profile_data',
      respond: persona.extras.teachingProfileData,
    },
    // Tour state.
    {
      method: 'get',
      path: '*/dashboardapi/v1/user_product_tours',
      respond: persona.extras.tourState,
    },
    // Essential AI dependency.
    {
      method: 'get',
      path: '*/api/v1/sections/assigned_essential_ai_dependency',
      respond: persona.extras.essentialAiDependency,
    },
    // Demo presets.
    {
      method: 'get',
      path: '*/api/v1/sections/demo/presets',
      respond: persona.extras.demoPresets,
    },
  ];

  // Degraded persona: drawer data stalls forever.
  if (tag === 'degraded') {
    routes.push({
      method: 'get',
      path: '*/teacher_dashboard/get_drawer_data',
      respond: () => new Promise(() => {}), // never resolves
    });
  } else {
    routes.push({
      method: 'get',
      path: '*/teacher_dashboard/get_drawer_data',
      respond: persona.extras.drawerData,
    });
  }

  return routes;
}

export {routesForPersona};
