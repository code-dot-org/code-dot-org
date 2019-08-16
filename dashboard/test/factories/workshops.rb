# Most academic year workshops are one day workshops.
# These specific workshop types are two day workshops.
TWO_DAY_AYW_SUBJECTS = [
  Pd::Workshop::SUBJECT_CSD_WORKSHOP_5,
  Pd::Workshop::SUBJECT_CSD_WORKSHOP_6,
  Pd::Workshop::SUBJECT_CSP_WORKSHOP_5,
  Pd::Workshop::SUBJECT_CSP_WORKSHOP_6
]

#
# Factories for different types of PD workshops
#
FactoryGirl.define do
  factory :workshop, class: 'Pd::Workshop', aliases: [:pd_workshop] do
    transient do
      num_sessions 1
      num_facilitators 0
      sessions_from {Date.current + 9.hours} # Start time of the first session, then one per day after that.
      each_session_hours 6
      num_enrollments 0
      enrolled_and_attending_users 0
      enrolled_unattending_users 0
      num_completed_surveys 0
      randomized_survey_answers false
      assign_session_code false
    end

    association :organizer, factory: :workshop_organizer
    location_name 'Hogwarts School of Witchcraft and Wizardry'
    course Pd::Workshop::COURSES.first
    subject {Pd::Workshop::SUBJECTS[course].try(&:first)}
    capacity 10
    on_map true
    funded false

    #
    # Traits
    #

    # TODO: Change into a sub-factory
    trait :teachercon do
      course Pd::Workshop::COURSE_CSP
      subject Pd::Workshop::SUBJECT_CSP_TEACHER_CON
    end

    # TODO: Change into a sub-factory
    trait :local_summer_workshop do
      course Pd::Workshop::COURSE_CSP
      subject Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP
    end

    # TODO: Change into a sub-factory + trait
    trait :local_summer_workshop_upcoming do
      local_summer_workshop
      num_sessions 5
      sessions_from {Date.current + 3.months}
    end

    # TODO: Change into a sub-factory
    trait :fit do
      course Pd::Workshop::COURSE_CSP
      subject Pd::Workshop::SUBJECT_CSP_FIT
    end

    trait :in_progress do
      started_at {Time.zone.now}
    end

    trait :ended do
      started_at {Time.zone.now}
      ended_at {Time.zone.now}
    end

    trait :with_codes_assigned do
      assign_session_code true
    end

    trait :funded do
      funded true
      funding_type {course == Pd::Workshop::COURSE_CSF ? Pd::Workshop::FUNDING_TYPE_FACILITATOR : nil}
    end

    #
    # Factory hooks
    #

    after(:build) do |workshop, evaluator|
      # Sessions, one per day starting today (unless they were manually provided)
      if evaluator.sessions.empty?
        evaluator.num_sessions.times do |i|
          params = [{
            workshop: workshop,
            start: evaluator.sessions_from + i.days,
            duration_hours: evaluator.each_session_hours
          }]
          params.prepend :with_assigned_code if evaluator.assign_session_code
          workshop.sessions << build(:pd_session, *params)
        end
      end
      evaluator.num_enrollments.times do
        workshop.enrollments << build(:pd_enrollment, workshop: workshop)
      end
      evaluator.enrolled_and_attending_users.times do
        teacher = create :teacher
        workshop.enrollments << build(:pd_enrollment, workshop: workshop, user: teacher)
        workshop.sessions.each do |session|
          session.attendances << build(:pd_attendance, session: session, teacher: teacher)
        end
      end
      evaluator.enrolled_unattending_users.times do
        teacher = create :teacher
        workshop.enrollments << build(:pd_enrollment, workshop: workshop, user: teacher)
      end
    end

    after(:create) do |workshop, evaluator|
      workshop.sessions.map(&:save)

      evaluator.num_facilitators.times do
        workshop.facilitators << (create :facilitator, course: workshop.course)
      end

      evaluator.num_completed_surveys.times do
        enrollment = create :pd_enrollment, workshop: workshop
        if workshop.teachercon?
          create :pd_teachercon_survey, pd_enrollment: enrollment, randomized_survey_answers: evaluator.randomized_survey_answers
        elsif workshop.local_summer?
          create :pd_local_summer_workshop_survey, pd_enrollment: enrollment, randomized_survey_answers: evaluator.randomized_survey_answers
        else
          raise 'Num_completed_surveys trait unsupported for this workshop type'
        end
      end
    end

    #
    # Sub-factories
    #

    # CSF Workshops, which are usually one-day workshops
    # that happen year-round.
    factory :csf_workshop do
      # Make a CSF 101 "Intro" workshop by default
      intro

      course Pd::Workshop::COURSE_CSF
      capacity 30          # Average capacity
      on_map true          # About 60% are on the map
      funded               # About 90% are funded
      num_sessions 1       # Most have 1 session
      num_facilitators 1   # Most have 1 facilitator
      each_session_hours 7 # The most common session length

      # CSF Intro, also known as CSF 101
      # Our most common workshop type as of August 2019.
      trait :intro do
        subject Pd::Workshop::SUBJECT_CSF_101
        location_name 'Walkerville Elementary School'
      end
      factory(:csf_intro_workshop, aliases: [:csf_101_workshop]) {intro}

      # CSF Deep Dive, also known as CSF 201
      trait :deep_dive do
        subject Pd::Workshop::SUBJECT_CSF_201
        location_name 'Third Street Elementary School'
      end
      factory(:csf_deep_dive_workshop, aliases: [:csf_201_workshop]) {deep_dive}
    end

    # CSD and CSP Academic Year Workshops
    # These are one- or two-day workshops on specific parts of our curriculum that happen
    # throughout the school year.  They have a lot in common.
    factory :academic_year_workshop do
      # Make a CSP workshop by default
      csp

      capacity 30          # Average capacity
      on_map false         # Never on the map
      funded               # More than half are funded
      num_facilitators 2   # Most have 2 facilitators

      # Course can be derived from the chosen subject

      # Workshops 5 and 6 are two-day workshops, others are one-day.
      num_sessions {TWO_DAY_AYW_SUBJECTS.include?(subject) ? 2 : 1}

      # The most common session length
      each_session_hours {TWO_DAY_AYW_SUBJECTS.include?(subject) ? 7 : 8}

      # CSP Academic Year Workshops
      trait :csp do
        course Pd::Workshop::COURSE_CSP
        location_name 'Bayside High School'

        # Possible subjects:
        # Pd::Workshop::SUBJECT_CSP_WORKSHOP_1
        # Pd::Workshop::SUBJECT_CSP_WORKSHOP_2
        # Pd::Workshop::SUBJECT_CSP_WORKSHOP_3
        # Pd::Workshop::SUBJECT_CSP_WORKSHOP_4
        # Pd::Workshop::SUBJECT_CSP_WORKSHOP_5 (2-day)
        # Pd::Workshop::SUBJECT_CSP_WORKSHOP_6 (2-day)
        subject Pd::Workshop::SUBJECT_CSP_WORKSHOP_1
      end
      factory(:csp_academic_year_workshop) {csp}

      # CSD Academic Year Workshops
      trait :csd do
        course Pd::Workshop::COURSE_CSD
        location_name 'Sunrise Middle School'

        # Possible subjects:
        # Pd::Workshop::SUBJECT_CSD_WORKSHOP_1
        # Pd::Workshop::SUBJECT_CSD_WORKSHOP_2
        # Pd::Workshop::SUBJECT_CSD_WORKSHOP_3
        # Pd::Workshop::SUBJECT_CSD_WORKSHOP_4
        # Pd::Workshop::SUBJECT_CSD_WORKSHOP_5 (2-day)
        # Pd::Workshop::SUBJECT_CSD_WORKSHOP_6 (2-day)
        subject Pd::Workshop::SUBJECT_CSD_WORKSHOP_1
      end
      factory(:csd_academic_year_workshop) {csd}
    end

    # TODO
    # - CSD 5-day Summer
    # - CSP 5-day Summer
    # - Admin workshop
    # - Facilitator workshop
    # - Counselor workshop
    # - Facilitator Weekend
  end
end
