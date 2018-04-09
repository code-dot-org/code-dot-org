module Pd
  module SharedWorkshopConstants
    COURSES = [
      COURSE_CSF = 'CS Fundamentals'.freeze,
      COURSE_CSP = 'CS Principles'.freeze,
      COURSE_ECS = 'Exploring Computer Science'.freeze,
      COURSE_CS_IN_A = 'CS in Algebra'.freeze,
      COURSE_CS_IN_S = 'CS in Science'.freeze,
      COURSE_CSD = 'CS Discoveries'.freeze,
      COURSE_COUNSELOR = 'Counselor'.freeze,
      COURSE_ADMIN = 'Admin'.freeze
    ].freeze

    STATES = [
      STATE_NOT_STARTED = 'Not Started'.freeze,
      STATE_IN_PROGRESS = 'In Progress'.freeze,
      STATE_ENDED = 'Ended'.freeze
    ].freeze

    SUBJECT_TEACHER_CON = 'Code.org TeacherCon'.freeze
    SUBJECT_FIT = 'Code.org Facilitator Weekend'.freeze
    SUBJECT_SUMMER_WORKSHOP = '5-day Summer'.freeze
    SUBJECTS = {
      COURSE_ECS => [
        SUBJECT_ECS_PHASE_2 = 'Phase 2 in-person'.freeze,
        SUBJECT_ECS_UNIT_3 = 'Unit 3 - HTML'.freeze,
        SUBJECT_ECS_UNIT_4 = 'Unit 4 - Scratch'.freeze,
        SUBJECT_ECS_UNIT_5 = 'Unit 5 - Data'.freeze,
        SUBJECT_ECS_UNIT_6 = 'Unit 6 - Robotics'.freeze,
        SUBJECT_ECS_PHASE_4 = 'Phase 4: Summer wrap-up'.freeze
      ],
      COURSE_CS_IN_A => [
        SUBJECT_CS_IN_A_PHASE_2 = 'Phase 2 in-person'.freeze,
        SUBJECT_CS_IN_A_PHASE_3 = 'Phase 3: Academic Year Development'.freeze
      ],
      COURSE_CS_IN_S => [
        SUBJECT_CS_IN_S_PHASE_2 = 'Phase 2: Blended Summer Study'.freeze,
        SUBJECT_CS_IN_S_PHASE_3_SEMESTER_1 = 'Phase 3 - Semester 1'.freeze,
        SUBJECT_CS_IN_S_PHASE_3_SEMESTER_2 = 'Phase 3 - Semester 2'.freeze
      ],
      COURSE_CSP => [
        SUBJECT_CSP_SUMMER_WORKSHOP = SUBJECT_SUMMER_WORKSHOP,
        SUBJECT_CSP_WORKSHOP_1 = 'Units 1 and 2: The Internet and Digital Information'.freeze,
        SUBJECT_CSP_WORKSHOP_2 = 'Units 2 and 3: Processing data, Algorithms, and Programming'.freeze,
        SUBJECT_CSP_WORKSHOP_3 = 'Units 4 and 5: Big Data, Privacy, and Building Apps'.freeze,
        SUBJECT_CSP_WORKSHOP_4 = 'Units 5 and 6: Building Apps and AP Assessment Prep'.freeze,
        SUBJECT_CSP_TEACHER_CON = SUBJECT_TEACHER_CON,
        SUBJECT_CSP_FIT = SUBJECT_FIT
      ],
      COURSE_CSD => [
        SUBJECT_CSD_SUMMER_WORKSHOP = SUBJECT_SUMMER_WORKSHOP,
        SUBJECT_CSD_UNITS_2_3 = 'Units 2 and 3: Web Development and Animations'.freeze,
        SUBJECT_CSD_UNIT_3_4 = 'Units 3 and 4: Building Games and User Centered Design'.freeze,
        SUBJECT_CSD_UNITS_4_5 = 'Units 4 and 5: App Prototyping and Data & Society'.freeze,
        SUBJECT_CSD_UNIT_6 = 'Unit 6: Physical Computing'.freeze,
        SUBJECT_CSD_TEACHER_CON = SUBJECT_TEACHER_CON,
        SUBJECT_CSD_FIT = SUBJECT_FIT
      ],
      COURSE_CSF => [
        SUBJECT_CSF_101 = 'Intro Workshop'.freeze,
        SUBJECT_CSF_FIT = SUBJECT_FIT
      ]
    }.freeze
  end
end
