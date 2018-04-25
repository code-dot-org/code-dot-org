# == Schema Information
#
# Table name: pd_applications
#
#  id                                  :integer          not null, primary key
#  user_id                             :integer
#  type                                :string(255)      not null
#  application_year                    :string(255)      not null
#  application_type                    :string(255)      not null
#  regional_partner_id                 :integer
#  status                              :string(255)
#  locked_at                           :datetime
#  notes                               :text(65535)
#  form_data                           :text(65535)      not null
#  created_at                          :datetime         not null
#  updated_at                          :datetime         not null
#  course                              :string(255)
#  response_scores                     :text(65535)
#  application_guid                    :string(255)
#  decision_notification_email_sent_at :datetime
#  accepted_at                         :datetime
#  properties                          :text(65535)
#  deleted_at                          :datetime
#
# Indexes
#
#  index_pd_applications_on_application_guid     (application_guid)
#  index_pd_applications_on_application_type     (application_type)
#  index_pd_applications_on_application_year     (application_year)
#  index_pd_applications_on_course               (course)
#  index_pd_applications_on_regional_partner_id  (regional_partner_id)
#  index_pd_applications_on_status               (status)
#  index_pd_applications_on_type                 (type)
#  index_pd_applications_on_user_id              (user_id)
#

require 'state_abbr'
require 'cdo/shared_constants/pd/facilitator1819_application_constants'

module Pd::Application
  class Facilitator1819Application < WorkshopAutoenrolledApplication
    include Facilitator1819ApplicationConstants

    serialized_attrs %w(
      fit_workshop_id
      auto_assigned_fit_enrollment_id
    )

    has_one :pd_fit_weekend1819_registration,
      class_name: 'Pd::FitWeekend1819Registration',
      foreign_key: 'pd_application_id'

    def send_decision_notification_email
      # Accepted, declined, and waitlisted are the only valid "final" states;
      # all other states shouldn't need emails, and we plan to send "Accepted"
      # emails manually
      return unless %w(declined waitlisted).include?(status)

      Pd::Application::Facilitator1819ApplicationMailer.send(status, self).deliver_now
      update!(decision_notification_email_sent_at: Time.zone.now)
    end

    def set_type_and_year
      self.application_year = YEAR_18_19
      self.application_type = FACILITATOR_APPLICATION
    end

    PROGRAMS = {
      csf: 'CS Fundamentals (Pre-K - 5th grade)',
      csd: 'CS Discoveries (6 - 10th grade)',
      csp: 'CS Principles (9 - 12th grade)'
    }.freeze
    PROGRAM_OPTIONS = PROGRAMS.values
    VALID_COURSES = PROGRAMS.keys.map(&:to_s)

    validates_uniqueness_of :user_id

    validates :course, presence: true, inclusion: {in: VALID_COURSES}
    before_validation :set_course_from_program
    def set_course_from_program
      self.course = PROGRAMS.key(program)
    end

    before_create :match_partner, if: -> {regional_partner.nil?}
    def match_partner
      self.regional_partner = RegionalPartner.find_by_region(zip_code, state_code)
    end

    # Are we still accepting applications?
    APPLICATION_CLOSE_DATE = Date.new(2018, 2, 1)
    def self.open?
      Time.zone.now < APPLICATION_CLOSE_DATE
    end

    # Queries for locked and (accepted or withdrawn) and assigned to a fit workshop
    # @param [ActiveRecord::Relation<Pd::Application::Facilitator1819Application>] applications_query
    #   (optional) defaults to all
    # @note this is not chainable since it inspects fit_workshop_id from serialized attributes,
    #   which must be done in the model.
    # @return [array]
    def self.fit_cohort(applications_query = all)
      applications_query.
        where(type: name).
        where(status: [:accepted, :withdrawn]).
        where.not(locked_at: nil).
        includes(:pd_fit_weekend1819_registration).
        select(&:fit_workshop_id?)
    end

    def fit_workshop
      return nil unless fit_workshop_id

      # attempt to retrieve from cache
      cache_fetch self.class.get_workshop_cache_key(fit_workshop_id) do
        Pd::Workshop.includes(:sessions, :enrollments).find_by(id: fit_workshop_id)
      end
    end

    def fit_workshop_date_and_location
      fit_workshop.try(&:date_and_location_name)
    end

    def registered_fit_workshop?
      # inspect the cached fit_workshop.enrollments rather than querying the DB
      fit_workshop.enrollments.any? {|e| e.user_id == user.id} if fit_workshop_id
    end

    GRADES = [
      'Pre-K'.freeze,
      'Kindergarten'.freeze,
      *(1..12).map {|n| "Grade #{n}".freeze},
      'Community college, college, or university',
      'Participants in a tech bootcamp or professional development program'
    ].freeze

    ONLY_WEEKEND = 'I will only be able to attend Saturday and Sunday of the training'.freeze

    def self.options
      {
        title: COMMON_OPTIONS[:title],
        state: COMMON_OPTIONS[:state],
        gender_identity: COMMON_OPTIONS[:gender_identity],
        race: COMMON_OPTIONS[:race],

        institution_type: [
          'School district',
          'Non-profit',
          'Institute of higher education',
          'Tech company',
          TEXT_FIELDS[:other_with_text]
        ],

        worked_in_cs_job: [YES, NO],

        completed_cs_courses_and_activities: [
          'Intro CS in high school',
          'Intro CS in college',
          'Advanced CS in high school or college',
          'Online (Udacity, Coursera, etc.)',
          'Attended a coding or CS camp',
          'Attended a CS professional development workshop',
          'I have a minor, major, certificate',
          NONE,
          TEXT_FIELDS[:other_with_text]
        ],

        diversity_training: [YES, NO],

        how_heard: [
          'Code.org email',
          'Code.org social media post',
          TEXT_FIELDS[:how_heard_facilitator],
          TEXT_FIELDS[:how_heard_code_org_staff],
          TEXT_FIELDS[:how_heard_regional_partner],
          'My employer',
          TEXT_FIELDS[:other_with_text]
        ],

        program: PROGRAM_OPTIONS,

        plan_on_teaching: [
          YES,
          NO,
          "I don’t know yet",
          TEXT_FIELDS[:other_with_text]
        ],

        ability_to_meet_requirements: [
          '1 = Unlikely: I have limited capacity to meet program expectations in 2018-19',
          *(2..4).map(&:to_s),
          '5 = Very likely: I can successfully meet all the expectations of the program'
        ],

        csf_availability: [
          YES,
          NO,
          ONLY_WEEKEND
        ],

        csd_csp_teachercon_availability: [
          'TeacherCon 1: June 17 - 22, 2018',
          'TeacherCon 2: July 22 - 27, 2018',
          TEXT_FIELDS[:not_available_for_teachercon]
        ],

        csd_csp_fit_availability: [
          'June 23 - 24, 2018 (immediately following TeacherCon 1)',
          'July 28 - 29, 2018 (immediately following TeacherCon 2)',
          TEXT_FIELDS[:not_available_for_fit_weekend]
        ],

        led_cs_extracurriculars: [
          'Hour of Code',
          'After-school or lunchtime computer science clubs',
          'Computer science-focused summer camps',
          TEXT_FIELDS[:other_please_list]
        ],

        teaching_experience: [YES, NO],

        grades_taught: [
          *GRADES,
          TEXT_FIELDS[:other_with_text]
        ],

        grades_currently_teaching: [
          *GRADES,
          TEXT_FIELDS[:other_with_text],
          'None - I don’t currently teach'
        ],

        subjects_taught: [
          'Computer Science',
          'Math',
          'Science',
          'Social Studies',
          'English/Language Arts',
          'History',
          'Art',
          'Foreign Language',
          TEXT_FIELDS[:other_with_text]
        ],

        years_experience: [
          '1-2 years',
          '3-5 years',
          '6+ years',
          'None'
        ],

        experience_leading: [
          'Hour of Code',
          'One or more of the CS Fundamentals (K-5) Courses',
          'CS in Algebra',
          'CS in Science',
          'CS Discoveries',
          'CS Principles (intro or AP-level)',
          'AP CS A',
          'Beauty and Joy of Computing',
          'Code HS',
          'Edhesive',
          'Exploring Computer Science',
          'Mobile CS Principles',
          'NMSI',
          'Project Lead the Way',
          'ScratchEd',
          TEXT_FIELDS[:other_with_text],
          "I don't have experience teaching any of these courses",
        ],

        completed_pd: [
          'CS Fundamentals (1 day workshop)',
          'CS in Algebra (one year professional learning program)',
          'CS in Science (one year professional learning program)',
          'CS Discoveries (pilot program)',
          'CS Discoveries (currently completing one year professional learning program)',
          'CS Principles (one year professional learning program)',
          'Exploring Computer Science (one year professional learning program)',
          "I haven't completed a Code.org Professional Learning Program as a teacher"
        ],

        code_org_facilitator: [YES, NO],

        code_org_facilitator_years: [
          '2014-15 school year',
          '2015-16 school year',
          '2016-17 school year',
          '2017-18 school year'
        ],

        code_org_facilitator_programs: [
          'CS Fundamentals',
          'CS in Algebra',
          'CS in Science',
          'Summer CS Discoveries workshop',
          'School year CS Discoveries workshop',
          'Summer CS Principles workshop',
          'School year CS Principles workshops',
          'Summer Exploring Computer Science workshop',
          'School year Exploring Computer Science workshops'
        ],

        have_led_pd: [YES, NO],

        groups_led_pd: [
          'K-12 teachers',
          'Other types of adult professional development',
          'None'
        ],

        available_during_week: [YES, NO],

        # Every hour, "8am ET / 5am PT" to "10pm ET / 7pm PT"
        weekly_availability: (5..19).map do |hour|
          "#{format_hour(hour + 3)} ET / #{format_hour(hour)} PT"
        end,

        travel_distance: [
          'Within my city',
          'Within my state',
          'Within my region (example: Pacific Northwest, Northeast, Southwest, etc.)',
          'Anywhere!'
        ]
      }
    end

    def self.required_fields
      %i(
        first_name
        last_name
        phone
        address
        city
        state
        zip_code
        gender_identity
        race
        institution_type
        current_employer
        job_title
        resume_link
        worked_in_cs_job
        completed_cs_courses_and_activities
        diversity_training
        how_heard

        program
        plan_on_teaching
        ability_to_meet_requirements

        led_cs_extracurriculars
        teaching_experience

        code_org_facilitator
        have_led_pd

        who_should_have_opportunity
        how_support_equity
        expected_teacher_needs
        describe_adapting_lesson_plan
        describe_strategies
        example_how_used_feedback
        example_how_provided_feedback
        hope_to_learn

        available_during_week
        travel_distance

        agree
      )
    end

    def dynamic_required_fields(hash)
      [].tap do |required|
        required << :cs_related_job_requirements if hash[:worked_in_cs_job] == YES
        required << :diversity_training_description if hash[:diversity_training] == YES

        if hash[:program] == PROGRAMS[:csf]
          required << :csf_availability
          required << :csf_partial_attendance_reason if hash[:csf_availability] == ONLY_WEEKEND
        elsif hash[:program].present?
          required << :csd_csp_teachercon_availability
          required << :csd_csp_fit_availability
        end

        if hash[:teaching_experience] == YES
          required.concat [
            :grades_taught,
            :grades_currently_teaching,
            :subjects_taught,
            :years_experience
          ]
        end

        if hash[:years_experience].present? && hash[:years_experience] != NONE
          required.concat [
            :experience_leading,
            :completed_pd
          ]
        end

        if hash[:code_org_facilitator] == YES
          required.concat [
            :code_org_facilitator_years,
            :code_org_facilitator_programs
          ]
        end

        if hash[:have_led_pd] == YES
          required.concat [
            :groups_led_pd,
            :describe_prior_pd
          ]
        end

        if hash[:available_during_week] == YES
          required << :weekly_availability
        end
      end
    end

    def first_name
      sanitize_form_data_hash[:first_name]
    end

    def last_name
      sanitize_form_data_hash[:last_name]
    end

    def program
      sanitize_form_data_hash[:program]
    end

    def zip_code
      sanitize_form_data_hash[:zip_code]
    end

    def state_name
      sanitize_form_data_hash[:state]
    end

    def state_code
      STATE_ABBR_WITH_DC_HASH.key(state_name).try(:to_s)
    end

    # Include additional text for all the multi-select fields that have the option
    def additional_text_fields
      [
        [:institution_type],
        [:completed_cs_courses_and_activities],
        [:how_heard, TEXT_FIELDS[:how_heard_facilitator], :how_heard_facilitator],
        [:how_heard, TEXT_FIELDS[:how_heard_code_org_staff], :how_heard_code_org_staff],
        [:how_heard, TEXT_FIELDS[:how_heard_regional_partner], :how_heard_regional_partner],
        [:how_heard],
        [:plan_on_teaching],
        [:led_cs_extracurriculars, TEXT_FIELDS[:other_please_list]],
        [:grades_taught],
        [:grades_currently_teaching],
        [:subjects_taught],
        [:experience_leading]
      ]
    end

    # memoize in a hash, per course
    FILTERED_LABELS ||= Hash.new do |h, key|
      labels_to_remove = (key == 'csf' ?
        [:csd_csp_fit_availability, :csd_csp_teachercon_availability]
        : # csd / csp
        [:csf_availability, :csf_partial_attendance_reason]
      )

      h[key] = ALL_LABELS_WITH_OVERRIDES.except(*labels_to_remove)
    end

    # @override
    # Filter out extraneous answers, based on selected program (course)
    def self.filtered_labels(course)
      raise "Invalid course #{course}" unless VALID_COURSES.include?(course)
      FILTERED_LABELS[course]
    end

    # @override
    def self.csv_header(course, user)
      # strip all markdown formatting out of the labels
      markdown = Redcarpet::Markdown.new(Redcarpet::Render::StripDown)
      CSV.generate do |csv|
        columns = filtered_labels(course).values.map {|l| markdown.render(l)}.map(&:strip)
        columns.push 'Status', 'Locked', 'Notes', 'Regional Partner'
        csv << columns
      end
    end

    # @override
    def self.cohort_csv_header
      CSV.generate do |csv|
        csv << ['Date Accepted', 'Name', 'School District', 'School Name', 'Email', 'Status']
      end
    end

    # @override
    def to_csv_row(user)
      answers = full_answers
      CSV.generate do |csv|
        row = self.class.filtered_labels(course).keys.map {|k| answers[k]}
        row.push status, locked?, notes, regional_partner_name
        csv << row
      end
    end

    # @override
    def to_cohort_csv_row
      CSV.generate do |csv|
        csv << [
          date_accepted,
          applicant_name,
          district_name,
          school_name,
          user.email,
          status
        ]
      end
    end

    # @override
    # Add account_email (based on the associated user's email) to the sanitized form data hash
    def sanitize_form_data_hash
      super.merge(account_email: user.email)
    end

    # Formats hour as 0-12(am|pm)
    # e.g. 7 -> 7am, 15 -> 3pm
    private_class_method def self.format_hour(hour)
      (Date.today + hour.hours).strftime("%l%P").strip
    end

    # @override
    def check_idempotency
      Pd::Application::Facilitator1819Application.find_by(user: user)
    end

    before_save :destroy_fit_autoenrollment, if: -> {status_changed? && status != "accepted"}
    def destroy_fit_autoenrollment
      return unless auto_assigned_fit_enrollment_id

      Pd::Enrollment.find_by(id: auto_assigned_fit_enrollment_id).try(:destroy)
      self.auto_assigned_fit_enrollment_id = nil
    end

    # override
    def enroll_user
      super
      return unless fit_workshop_id

      enrollment = Pd::Enrollment.where(
        pd_workshop_id: fit_workshop_id,
        email: user.email
      ).first_or_initialize

      # If this is a new enrollment, we want to:
      #   - save it with all required data
      #   - save a reference to it in properties
      #   - delete the previous auto-created enrollment if it exists
      if enrollment.new_record?
        enrollment.update(
          user: user,
          school_info: user.school_info,
          full_name: user.name
        )
        enrollment.save!

        destroy_fit_autoenrollment
        self.auto_assigned_fit_enrollment_id = enrollment.id
      end
    end

    # G1 facilitators are always associated with Phoenix
    # G2 facilitators are always associated with Atlanta
    # G3 facilitators are assigned based on their partner mapping, arbitrarily
    #   defaulting to Phoenix
    def find_default_fit_teachercon
      return unless regional_partner

      return TC_PHOENIX if regional_partner.group == 1
      return TC_ATLANTA if regional_partner.group == 2

      return get_matching_teachercon(regional_partner) || TC_PHOENIX
    end

    # Assigns the default FiT workshop, if one is not yet assigned
    def assign_default_fit_workshop!
      return if fit_workshop_id
      update! fit_workshop_id: find_default_fit_workshop.try(:id)
    end

    def find_default_fit_workshop
      return unless regional_partner

      find_fit_workshop(
        course: workshop_course,
        city: find_default_fit_teachercon[:city]
      )
    end

    # override
    def self.prefetch_associated_models(applications)
      # also prefetch fit workshops
      prefetch_workshops applications.flat_map {|a| [a.pd_workshop_id, a.fit_workshop_id]}.uniq.compact
    end
  end
end
