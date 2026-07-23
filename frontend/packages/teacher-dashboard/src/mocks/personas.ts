// Persona definitions for the standalone dev host. Each persona is a named
// data set that the MSW handlers serve, producing a distinct homepage
// experience without a backend.

// Inline the server section shape to avoid pulling moved types into tsc scope.
// Field names match the mix of camelCase/snake_case that sectionFromServerSection reads.
interface ServerSectionLike {
  id: number;
  name: string;
  code: string | null;
  course_id: number | null;
  course_offering_id?: number | null;
  course_version_id?: number | null;
  course_display_name?: string | null;
  courseVersionName?: string | null;
  unit_id?: number | null;
  unitName?: string | null;
  unitPosition?: number | null;
  createdAt?: string;
  demo_type?: string | null;
  grades?: string[];
  hidden: boolean;
  lesson_extras: boolean;
  login_type: string;
  pairing_allowed: boolean;
  participant_type?: string;
  providerManaged?: boolean;
  restrict_section?: boolean;
  sharing_disabled: boolean;
  studentCount: number;
  tts_autoplay_enabled?: boolean;
  avatar_color?: number | null;
  avatar_emoji?: number | null;
  sectionInstructors?: {
    id: number;
    status: string;
    instructor_email: string;
    instructor_name: string;
  }[];
}

export interface Persona {
  label: string;
  description: string;
  sections: ServerSectionLike[];
  courseOfferings: Record<string, unknown>;
  availableParticipantTypes: string[];
  flags: Record<string, unknown>;
  experiments: string[];
  currentUser: {
    userId: number;
    displayName: string;
    gradesTeaching: string[];
    aiChatAccessLevel: string;
  };
  extras: {
    coteacherInvites: Record<string, unknown>[];
    drawerData: Record<string, unknown>;
    tourState: Record<string, unknown>[];
    teachingProfileData: {data: {matchedPersona: boolean}};
    essentialAiDependency: {has_assigned_essential_ai_dependency: boolean};
    demoPresets: Record<string, unknown>;
  };
}

function makeSection(
  overrides: Partial<ServerSectionLike> & {id: number; name: string},
): ServerSectionLike {
  return {
    code: `ABCDEF${overrides.id}`,
    course_id: null,
    course_offering_id: null,
    course_version_id: null,
    course_display_name: null,
    courseVersionName: null,
    unit_id: null,
    unitName: null,
    unitPosition: null,
    createdAt: '2025-09-01T12:00:00.000Z',
    hidden: false,
    lesson_extras: false,
    login_type: 'word',
    pairing_allowed: true,
    participant_type: 'student',
    providerManaged: false,
    restrict_section: false,
    sharing_disabled: false,
    studentCount: 5,
    tts_autoplay_enabled: false,
    grades: ['5'],
    avatar_color: 0,
    avatar_emoji: 0,
    ...overrides,
  };
}

// Course offering/version/unit IDs used across personas.
// These are arbitrary but internally consistent.
const COURSE = {
  csf: {
    offeringId: 1,
    versionId: 100,
    courseId: 1000,
    displayName: "CS Fundamentals '24-'25",
    versionName: 'csf-2024',
    units: {
      courseA: {id: 1001, name: 'Course A', position: 1},
      courseB: {id: 1002, name: 'Course B', position: 2},
      courseC: {id: 1003, name: 'Course C', position: 3},
    },
  },
  csd: {
    offeringId: 2,
    versionId: 200,
    courseId: 2000,
    displayName: "CS Discoveries '24-'25",
    versionName: 'csd-2024',
    units: {
      problemSolving: {
        id: 2001,
        name: 'Problem Solving and Computing',
        position: 1,
      },
      webDev: {id: 2002, name: 'Web Development', position: 2},
      interactiveAnimations: {
        id: 2003,
        name: 'Interactive Animations and Games',
        position: 3,
      },
    },
  },
  csp: {
    offeringId: 3,
    versionId: 300,
    courseId: 3000,
    displayName: "CS Principles '24-'25",
    versionName: 'csp-2024',
    units: {
      digitalInfo: {id: 3001, name: 'Digital Information', position: 1},
      internet: {id: 3002, name: 'The Internet', position: 2},
      apExam: {id: 3003, name: 'AP Exam Review', position: 3},
    },
  },
  csa: {
    offeringId: 4,
    versionId: 400,
    courseId: 4000,
    displayName: "CS A '24-'25",
    versionName: 'csa-2024',
    units: {
      oop: {id: 4001, name: 'Object-Oriented Programming', position: 1},
      dataStructures: {id: 4002, name: 'Data Structures', position: 2},
    },
  },
  hoc: {
    offeringId: 5,
    versionId: 500,
    courseId: 5000,
    displayName: 'Hour of Code 2024',
    versionName: 'hoc-2024',
    units: {
      dance: {id: 5001, name: 'Dance Party', position: 1},
    },
  },
} as const;

function courseVersionEntry(
  c: (typeof COURSE)[keyof typeof COURSE],
): Record<string, unknown> {
  return {
    [c.versionId]: {
      id: c.versionId,
      content_root_id: c.courseId,
      is_recommended: true,
      is_stable: true,
      key: c.versionName,
      locale_codes: ['en-US'],
      locales: ['English'],
      name: c.displayName,
      path: `/courses/${c.versionName}`,
      units: {},
      version_year: '2024',
    },
  };
}

const COURSE_OFFERINGS = {
  [COURSE.csf.offeringId]: {
    id: COURSE.csf.offeringId,
    display_name: 'CS Fundamentals',
    is_featured: true,
    participant_audience: 'student',
    course_versions: courseVersionEntry(COURSE.csf),
  },
  [COURSE.csd.offeringId]: {
    id: COURSE.csd.offeringId,
    display_name: 'CS Discoveries',
    is_featured: true,
    participant_audience: 'student',
    course_versions: courseVersionEntry(COURSE.csd),
  },
  [COURSE.csp.offeringId]: {
    id: COURSE.csp.offeringId,
    display_name: 'CS Principles',
    is_featured: true,
    participant_audience: 'student',
    course_versions: courseVersionEntry(COURSE.csp),
  },
  [COURSE.csa.offeringId]: {
    id: COURSE.csa.offeringId,
    display_name: 'CS A',
    is_featured: true,
    participant_audience: 'student',
    course_versions: courseVersionEntry(COURSE.csa),
  },
  [COURSE.hoc.offeringId]: {
    id: COURSE.hoc.offeringId,
    display_name: 'Hour of Code',
    is_featured: false,
    participant_audience: 'student',
    course_versions: courseVersionEntry(COURSE.hoc),
  },
};

const DEFAULT_CURRENT_USER = {
  userId: 42,
  displayName: 'Jane Doe',
  gradesTeaching: ['5', '6'],
  aiChatAccessLevel: 'available',
};

const DEFAULT_EXTRAS: Persona['extras'] = {
  coteacherInvites: [],
  drawerData: {items: []},
  tourState: [],
  teachingProfileData: {data: {matchedPersona: true}},
  essentialAiDependency: {has_assigned_essential_ai_dependency: false},
  demoPresets: {},
};

export const PERSONA_TAGS = [
  'established',
  'new-teacher',
  'archived-only',
  'coteacher-invite',
  'many-sections',
  'degraded',
] as const;

export type PersonaTag = (typeof PERSONA_TAGS)[number];

export const PERSONAS: Record<PersonaTag, Persona> = {
  established: {
    label: 'Established Teacher',
    description:
      '2 active sections with assigned courses, word + picture login',
    sections: [
      makeSection({
        id: 101,
        name: 'Period 1 - CS Discoveries',
        login_type: 'word',
        code: 'ABCDEF',
        studentCount: 24,
        grades: ['6'],
        createdAt: '2025-08-15T09:00:00.000Z',
        course_id: COURSE.csd.courseId,
        course_offering_id: COURSE.csd.offeringId,
        course_version_id: COURSE.csd.versionId,
        course_display_name: COURSE.csd.displayName,
        courseVersionName: COURSE.csd.versionName,
        unit_id: COURSE.csd.units.problemSolving.id,
        unitName: COURSE.csd.units.problemSolving.name,
        unitPosition: COURSE.csd.units.problemSolving.position,
        avatar_color: 5,
        avatar_emoji: 7,
      }),
      makeSection({
        id: 102,
        name: 'Period 3 - CS Principles',
        login_type: 'picture',
        code: 'GHIJKL',
        studentCount: 18,
        grades: ['9'],
        createdAt: '2025-08-15T09:30:00.000Z',
        course_id: COURSE.csp.courseId,
        course_offering_id: COURSE.csp.offeringId,
        course_version_id: COURSE.csp.versionId,
        course_display_name: COURSE.csp.displayName,
        courseVersionName: COURSE.csp.versionName,
        avatar_color: 8,
        avatar_emoji: 1,
      }),
    ],
    courseOfferings: COURSE_OFFERINGS,
    availableParticipantTypes: ['student'],
    flags: {},
    experiments: [],
    currentUser: DEFAULT_CURRENT_USER,
    extras: {...DEFAULT_EXTRAS},
  },
  'new-teacher': {
    label: 'New Teacher',
    description: 'Empty sections, onboarding eligible',
    sections: [],
    courseOfferings: COURSE_OFFERINGS,
    availableParticipantTypes: ['student'],
    flags: {},
    experiments: [],
    currentUser: {...DEFAULT_CURRENT_USER, displayName: 'New Teacher'},
    extras: {
      ...DEFAULT_EXTRAS,
      teachingProfileData: {data: {matchedPersona: false}},
    },
  },
  'archived-only': {
    label: 'Archived Only',
    description: '3 hidden sections from prior semesters with varied courses',
    sections: [
      makeSection({
        id: 201,
        name: 'Fall 2024 - CS Intro',
        hidden: true,
        code: 'MNOPQR',
        studentCount: 20,
        grades: ['9'],
        createdAt: '2024-08-20T10:00:00.000Z',
        course_id: COURSE.csd.courseId,
        course_offering_id: COURSE.csd.offeringId,
        course_version_id: COURSE.csd.versionId,
        course_display_name: COURSE.csd.displayName,
        courseVersionName: COURSE.csd.versionName,
        avatar_color: 2,
        avatar_emoji: 3,
      }),
      makeSection({
        id: 202,
        name: 'Spring 2024 - Web Dev',
        hidden: true,
        code: 'STUVWX',
        studentCount: 15,
        grades: ['6'],
        createdAt: '2024-01-10T14:00:00.000Z',
        avatar_color: 13,
        avatar_emoji: 12,
      }),
      makeSection({
        id: 203,
        name: 'Summer 2024 - Camp',
        hidden: true,
        code: 'YZABCD',
        studentCount: 8,
        grades: ['3'],
        createdAt: '2024-06-01T08:00:00.000Z',
        course_id: COURSE.csf.courseId,
        course_offering_id: COURSE.csf.offeringId,
        course_version_id: COURSE.csf.versionId,
        course_display_name: COURSE.csf.displayName,
        courseVersionName: COURSE.csf.versionName,
        unit_id: COURSE.csf.units.courseB.id,
        unitName: COURSE.csf.units.courseB.name,
        unitPosition: COURSE.csf.units.courseB.position,
        avatar_color: 8,
        avatar_emoji: 8,
      }),
    ],
    courseOfferings: COURSE_OFFERINGS,
    availableParticipantTypes: ['student'],
    flags: {},
    experiments: [],
    currentUser: DEFAULT_CURRENT_USER,
    extras: {...DEFAULT_EXTRAS},
  },
  'coteacher-invite': {
    label: 'Coteacher Invite',
    description: '1 section with assigned AP CSP + a pending coteacher invite',
    sections: [
      makeSection({
        id: 301,
        name: 'AP CS Principles',
        login_type: 'email',
        code: 'EFGHIJ',
        studentCount: 30,
        grades: ['11'],
        createdAt: '2025-08-12T08:00:00.000Z',
        course_id: COURSE.csp.courseId,
        course_offering_id: COURSE.csp.offeringId,
        course_version_id: COURSE.csp.versionId,
        course_display_name: COURSE.csp.displayName,
        courseVersionName: COURSE.csp.versionName,
        unit_id: COURSE.csp.units.internet.id,
        unitName: COURSE.csp.units.internet.name,
        unitPosition: COURSE.csp.units.internet.position,
        avatar_color: 3,
        avatar_emoji: 5,
      }),
    ],
    courseOfferings: COURSE_OFFERINGS,
    availableParticipantTypes: ['student'],
    flags: {},
    experiments: [],
    currentUser: DEFAULT_CURRENT_USER,
    extras: {
      ...DEFAULT_EXTRAS,
      coteacherInvites: [
        {
          id: 1,
          status: 'invited',
          instructor_email: 'coteacher@school.edu',
          instructor_name: 'Co Teacher',
          invited_by_name: 'Jane Doe',
          invited_by_email: 'jane@school.edu',
          section_id: '301',
          section_name: 'AP CS Principles',
          participant_type: 'student',
        },
      ],
    },
  },
  'many-sections': {
    label: 'Many Sections',
    description:
      '9 sections: varied courses, login types, grades, dates, provider-managed, co-taught, zero-student edge',
    sections: [
      makeSection({
        id: 401,
        name: 'Period 1 - Introduction to Computer Science Fundamentals and Computational Thinking',
        login_type: 'word',
        code: 'KLMNOP',
        studentCount: 28,
        grades: ['K'],
        createdAt: '2025-08-18T07:30:00.000Z',
        course_id: COURSE.csf.courseId,
        course_offering_id: COURSE.csf.offeringId,
        course_version_id: COURSE.csf.versionId,
        course_display_name: COURSE.csf.displayName,
        courseVersionName: COURSE.csf.versionName,
        unit_id: COURSE.csf.units.courseA.id,
        unitName: COURSE.csf.units.courseA.name,
        unitPosition: COURSE.csf.units.courseA.position,
        avatar_color: 0,
        avatar_emoji: 0,
      }),
      makeSection({
        id: 402,
        name: 'Period 2 - CS Discoveries',
        login_type: 'picture',
        code: 'QRSTUV',
        studentCount: 1,
        grades: ['6'],
        createdAt: '2025-09-02T13:00:00.000Z',
        course_id: COURSE.csd.courseId,
        course_offering_id: COURSE.csd.offeringId,
        course_version_id: COURSE.csd.versionId,
        course_display_name: COURSE.csd.displayName,
        courseVersionName: COURSE.csd.versionName,
        avatar_color: 6,
        avatar_emoji: 9,
      }),
      makeSection({
        id: 403,
        name: 'Period 3 - Web Development',
        login_type: 'email',
        code: 'WXYZ12',
        studentCount: 150,
        grades: ['12'],
        createdAt: '2025-01-06T08:00:00.000Z',
        avatar_color: 11,
        avatar_emoji: 4,
      }),
      makeSection({
        id: 404,
        name: 'Period 4 - AP CSP',
        login_type: 'google_classroom',
        code: null,
        studentCount: 25,
        grades: ['9'],
        createdAt: '2025-08-20T10:00:00.000Z',
        providerManaged: true,
        course_id: COURSE.csp.courseId,
        course_offering_id: COURSE.csp.offeringId,
        course_version_id: COURSE.csp.versionId,
        course_display_name: COURSE.csp.displayName,
        courseVersionName: COURSE.csp.versionName,
        unit_id: COURSE.csp.units.digitalInfo.id,
        unitName: COURSE.csp.units.digitalInfo.name,
        unitPosition: COURSE.csp.units.digitalInfo.position,
        avatar_color: 15,
        avatar_emoji: 13,
      }),
      makeSection({
        id: 405,
        name: 'Period 5 - CS A',
        login_type: 'clever',
        code: null,
        studentCount: 5,
        grades: ['12'],
        createdAt: '2025-08-25T11:15:00.000Z',
        providerManaged: true,
        course_id: COURSE.csa.courseId,
        course_offering_id: COURSE.csa.offeringId,
        course_version_id: COURSE.csa.versionId,
        course_display_name: COURSE.csa.displayName,
        courseVersionName: COURSE.csa.versionName,
        unit_id: COURSE.csa.units.oop.id,
        unitName: COURSE.csa.units.oop.name,
        unitPosition: COURSE.csa.units.oop.position,
        avatar_color: 19,
        avatar_emoji: 20,
      }),
      makeSection({
        id: 409,
        name: 'Period 6 - CS Discoveries (Co-taught)',
        login_type: 'email',
        code: 'COTEACH',
        studentCount: 22,
        grades: ['7'],
        createdAt: '2025-08-22T08:00:00.000Z',
        course_id: COURSE.csd.courseId,
        course_offering_id: COURSE.csd.offeringId,
        course_version_id: COURSE.csd.versionId,
        course_display_name: COURSE.csd.displayName,
        courseVersionName: COURSE.csd.versionName,
        unit_id: COURSE.csd.units.webDev.id,
        unitName: COURSE.csd.units.webDev.name,
        unitPosition: COURSE.csd.units.webDev.position,
        avatar_color: 4,
        avatar_emoji: 11,
        sectionInstructors: [
          {
            id: 1,
            status: 'active',
            instructor_email: 'busyteacher@school.edu',
            instructor_name: 'Busy Teacher',
          },
          {
            id: 2,
            status: 'active',
            instructor_email: 'coteacher@school.edu',
            instructor_name: 'Alex Rivera',
          },
        ],
      }),
      makeSection({
        id: 406,
        name: 'After School Club',
        login_type: 'word',
        code: '345678',
        studentCount: 0,
        grades: ['3'],
        createdAt: '2025-10-01T15:00:00.000Z',
        avatar_color: 9,
        avatar_emoji: 6,
      }),
      makeSection({
        id: 407,
        name: 'Summer Workshop',
        login_type: 'email',
        code: '9ABCDE',
        studentCount: 12,
        participant_type: 'facilitator',
        grades: ['Other'],
        createdAt: '2025-06-15T09:00:00.000Z',
        avatar_color: 16,
        avatar_emoji: 17,
      }),
      makeSection({
        id: 408,
        name: 'Archived Section',
        login_type: 'word',
        code: 'FGHIJK',
        studentCount: 20,
        grades: ['1'],
        createdAt: '2024-09-03T08:00:00.000Z',
        hidden: true,
        course_id: COURSE.csf.courseId,
        course_offering_id: COURSE.csf.offeringId,
        course_version_id: COURSE.csf.versionId,
        course_display_name: COURSE.csf.displayName,
        courseVersionName: COURSE.csf.versionName,
        avatar_color: 18,
        avatar_emoji: 2,
      }),
    ],
    courseOfferings: COURSE_OFFERINGS,
    availableParticipantTypes: ['student', 'facilitator'],
    flags: {},
    experiments: [],
    currentUser: {...DEFAULT_CURRENT_USER, displayName: 'Busy Teacher'},
    extras: {...DEFAULT_EXTRAS},
  },
  degraded: {
    label: 'Degraded Backend',
    description:
      '2 sections, /valid_course_offerings returns 500, /get_drawer_data stalls',
    sections: [
      makeSection({
        id: 501,
        name: 'Period 1',
        code: 'LMNOPQ',
        studentCount: 20,
        grades: ['6'],
        createdAt: '2025-09-01T12:00:00.000Z',
        avatar_color: 7,
        avatar_emoji: 14,
      }),
      makeSection({
        id: 502,
        name: 'Period 2',
        code: 'RSTUVW',
        studentCount: 18,
        grades: ['9'],
        createdAt: '2025-09-01T12:00:00.000Z',
        avatar_color: 14,
        avatar_emoji: 10,
      }),
    ],
    courseOfferings: {},
    availableParticipantTypes: ['student'],
    flags: {},
    experiments: [],
    currentUser: DEFAULT_CURRENT_USER,
    extras: {...DEFAULT_EXTRAS},
  },
};
