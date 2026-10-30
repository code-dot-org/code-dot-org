# Most academic year workshops are one day workshops.
# These specific workshop types are two day workshops.
unless defined? TWO_DAY_AYW_SUBJECTS
  TWO_DAY_AYW_SUBJECTS = [
    Pd::Workshop::SUBJECT_CSD_WORKSHOP_1_2,
    Pd::Workshop::SUBJECT_CSD_WORKSHOP_3_4,
    Pd::Workshop::SUBJECT_CSP_WORKSHOP_1_2,
    Pd::Workshop::SUBJECT_CSP_WORKSHOP_3_4
  ]
end

#
# Factories for different types of PD workshops
#
FactoryBot.define do
  factory :workshop, class: 'Pd::Workshop', aliases: [:pd_workshop] do
    transient do
      num_sessions {1}
      virtual {false}
      num_facilitators {0}
      sessions_from {Time.zone.today + 9.hours} # Start time of the first session, then one per day after that.
      session_location_name {nil}
      session_location_address {nil}
      session_meeting_link {nil}
      each_session_hours {6}
      num_enrollments {0}
      enrolled_and_attending_users {0}
      enrolled_absent_users {0}
      assign_session_code {false}
    end

    association :organizer, factory: :workshop_organizer
    course {Pd::Workshop::COURSE_CSP}
    subject {Pd::Workshop::SUBJECTS[course].try(&:second)}
    capacity {10}
    name {'Cool workshop'}
    description {'A really cool workshop'}
    grades {['K', '1']}

    #
    # Traits
    #

    # TODO: Change into a sub-factory
    trait :teachercon do
      course {Pd::Workshop::COURSE_CSP}
      subject {Pd::Workshop::SUBJECT_CSP_TEACHER_CON}
    end

    trait :in_progress do
      started_at {Time.zone.now}
    end

    trait :ended do
      started_at {Time.zone.now}
      ended_at {Time.zone.now}
    end

    trait :with_codes_assigned do
      assign_session_code {true}
    end

    trait :funded do
      funded {true}
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
            duration_hours: evaluator.each_session_hours,
            session_format: evaluator.virtual ? 'virtual' : 'in_person',
            location_name: evaluator.session_location_name,
            location_address: evaluator.session_location_address,
            meeting_link: evaluator.session_meeting_link
          }]
          params.prepend :with_assigned_code if evaluator.assign_session_code
          workshop.sessions << build(:pd_session, *params)
        end
      end
      evaluator.num_enrollments.times do
        workshop.enrollments << build(:pd_enrollment, workshop: workshop)
      end
      evaluator.enrolled_and_attending_users.times do
        teacher = create(:teacher)
        workshop.enrollments << build(:pd_enrollment, workshop: workshop, user: teacher)
        workshop.sessions.each do |session|
          session.attendances << build(:pd_attendance, session: session, teacher: teacher)
        end
      end
      evaluator.enrolled_absent_users.times do
        teacher = create(:teacher)
        workshop.enrollments << build(:pd_enrollment, workshop: workshop, user: teacher)
      end
    end

    after(:create) do |workshop, evaluator|
      workshop.sessions.map(&:save)

      evaluator.num_facilitators.times do
        workshop.facilitators << (create(:facilitator, course: workshop.course))
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

      course {Pd::Workshop::COURSE_CSF}
      capacity {30}          # Average capacity
      num_sessions {1}       # Most have 1 session
      num_facilitators {1}   # Most have 1 facilitator
      each_session_hours {7} # The most common session length

      # CSF Intro, also known as CSF 101
      # Our most common workshop type as of August 2019.
      trait :intro do
        subject {Pd::Workshop::SUBJECT_CSF_101}
        session_location_name {'Walkerville Elementary School'}
      end
      factory(:csf_intro_workshop, aliases: [:csf_101_workshop]) {intro}

      # CSF Deep Dive, also known as CSF 201
      trait :deep_dive do
        subject {Pd::Workshop::SUBJECT_CSF_201}
        session_location_name {'Third Street Elementary School'}
      end
      factory(:csf_deep_dive_workshop, aliases: [:csf_201_workshop]) {deep_dive}
    end

    # CSD and CSP Academic Year Workshops
    # These are one- or two-day workshops on specific parts of our curriculum that happen
    # throughout the school year.  They have a lot in common.
    factory :academic_year_workshop do
      # Make a CSP workshop by default
      csp

      capacity {30}          # Average capacity
      num_facilitators {2}   # Most have 2 facilitators

      # Some specific academic year workshops are usually two days instead of one.
      # Add a trait making it easy to specify that we're testing a two-day workshop.
      trait :two_day do
        subject do
          if course == Pd::Workshop::COURSE_CSP
            Pd::Workshop::SUBJECT_CSP_WORKSHOP_1_2
          else
            Pd::Workshop::SUBJECT_CSD_WORKSHOP_1_2
          end
        end
      end

      # Workshops 5 and 6 are two-day workshops, others are one-day.
      num_sessions {TWO_DAY_AYW_SUBJECTS.include?(subject) ? 2 : 1}

      # The most common session length
      each_session_hours {TWO_DAY_AYW_SUBJECTS.include?(subject) ? 7 : 8}

      # CSP Academic Year Workshops
      trait :csp do
        course {Pd::Workshop::COURSE_CSP}
        session_location_name {'Bayside High School'}

        # Possible subjects:
        # Pd::Workshop::SUBJECT_CSP_WORKSHOP_1
        # Pd::Workshop::SUBJECT_CSP_WORKSHOP_2
        # Pd::Workshop::SUBJECT_CSP_WORKSHOP_3
        # Pd::Workshop::SUBJECT_CSP_WORKSHOP_4
        # Pd::Workshop::SUBJECT_CSP_WORKSHOP_1_2 (2-day)
        # Pd::Workshop::SUBJECT_CSP_WORKSHOP_3_4 (2-day)
        subject {Pd::Workshop::SUBJECT_CSP_WORKSHOP_1}
      end
      factory(:csp_academic_year_workshop) {csp}

      # CSD Academic Year Workshops
      trait :csd do
        course {Pd::Workshop::COURSE_CSD}
        session_location_name {'Sunrise Middle School'}

        # Possible subjects:
        # Pd::Workshop::SUBJECT_CSD_WORKSHOP_1
        # Pd::Workshop::SUBJECT_CSD_WORKSHOP_2
        # Pd::Workshop::SUBJECT_CSD_WORKSHOP_3
        # Pd::Workshop::SUBJECT_CSD_WORKSHOP_4
        # Pd::Workshop::SUBJECT_CSD_WORKSHOP_1_2 (2-day)
        # Pd::Workshop::SUBJECT_CSD_WORKSHOP_3_4 (2-day)
        subject {Pd::Workshop::SUBJECT_CSD_WORKSHOP_1}
      end
      factory(:csd_academic_year_workshop) {csd}

      # CSA Academic Year Workshops
      trait :csa do
        course {Pd::Workshop::COURSE_CSA}
        session_location_name {'Greendale Community College'}

        # Possible subjects:
        # Pd::Workshop::SUBJECT_CSA_WORKSHOP_1
        # Pd::Workshop::SUBJECT_CSA_WORKSHOP_2
        # Pd::Workshop::SUBJECT_CSA_WORKSHOP_3
        # Pd::Workshop::SUBJECT_CSA_WORKSHOP_4
        # Pd::Workshop::SUBJECT_CSA_WORKSHOP_1_2 (2-day)
        # Pd::Workshop::SUBJECT_CSA_WORKSHOP_3_4 (2-day)
        subject {Pd::Workshop::SUBJECT_CSA_WORKSHOP_1}
      end
      factory(:csa_academic_year_workshop) {csa}
    end

    # 5-day local summer workshops
    factory :summer_workshop do
      # CSP local summer workshop by default
      csp

      session_location_name {'Greendale Community College'}
      on_map {false}         # Never on the map
      funded {false}         # Less than half are funded
      num_facilitators {2}   # Most have 2 facilitators
      num_sessions {5}       # Most have 5 sessions
      each_session_hours {8} # The most common session length
      # Schedule it for summer of the current application cycle
      sessions_from do
        Date.new(
          Pd::Application::ActiveApplicationModels::APPLICATION_CURRENT_YEAR.split('-').first.to_i, 7, 4
        )
      end

      trait :csp do
        course {Pd::Workshop::COURSE_CSP}
        subject {Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP}
        capacity {40}          # Average capacity
      end
      factory(:csp_summer_workshop) {csp}

      trait :csd do
        course {Pd::Workshop::COURSE_CSD}
        subject {Pd::Workshop::SUBJECT_CSD_SUMMER_WORKSHOP}
        capacity {35}          # Average capacity
      end
      factory(:csd_summer_workshop) {csd}

      trait :csa do
        course {Pd::Workshop::COURSE_CSA}
        subject {Pd::Workshop::SUBJECT_CSA_SUMMER_WORKSHOP}
        capacity {35}          # Average capacity
      end
      factory(:csa_summer_workshop) {csa}
    end

    factory :facilitator_workshop do
      course {Pd::Workshop::COURSE_FACILITATOR}
      subject {nil}
      capacity {100}         # Typical capacity
      num_sessions {2}       # Most have 2 sessions
      num_facilitators {0}   # Most have no facilitators
      each_session_hours {8} # The most common session length
    end

    # Facilitator-in-training weekend workshop
    factory :fit_workshop do
      subject {Pd::Workshop::SUBJECT_FIT}
      course {Pd::Workshop::COURSE_CSP} # CSD is also valid
      capacity {100}         # Typical capacity
      num_sessions {2}       # Most have 2 sessions
      num_facilitators {2}   # Most have 2 facilitators
      each_session_hours {8} # The most common session length
    end

    factory :admin_workshop do
      course {Pd::Workshop::COURSE_ADMIN}
      subject {nil}
      capacity {35}          # Average capacity
      num_sessions {1}       # Most have 1 session
      num_facilitators {0}   # Most have no facilitators
      each_session_hours {2} # The most common session length
    end

    factory :admin_counselor_workshop do
      course {Pd::Workshop::COURSE_ADMIN_COUNSELOR}
      subject {Pd::Workshop::SUBJECT_ADMIN_COUNSELOR_WELCOME}
      capacity {35}          # Average capacity
      num_sessions {1}       # Most have 1 session
      num_facilitators {1}   # Want to work with facilitators
      each_session_hours {2} # Not sure on session length
    end

    factory :counselor_workshop do
      course {Pd::Workshop::COURSE_COUNSELOR}
      subject {nil}
      capacity {40}          # Average capacity
      num_sessions {1}       # Most have 1 session
      num_facilitators {0}   # Most have no facilitators
      each_session_hours {6} # The most common session length
    end

    factory :byo_workshop do
      course {Pd::Workshop::COURSE_BUILD_YOUR_OWN}
      subject {nil}
      participant_group_type {'Regional'}
      capacity {40}          # Average capacity
      num_sessions {1}       # Most have 1 session
      num_facilitators {0}   # Most have no facilitators
      each_session_hours {6} # The most common session length

      transient do
        course_offerings {[]} # Allow overriding course offerings
      end

      after(:build) do |workshop, evaluator|
        if evaluator.course_offerings.empty?
          # Create a default course offering if none are provided
          workshop.course_offerings << build(:course_offering)
        else
          evaluator.course_offerings.each do |offering|
            workshop.course_offerings << offering
          end
        end
      end
    end
  end
end
