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
  class Facilitator1819Application < ApplicationBase
    include Facilitator1819ApplicationConstants

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

    validates_uniqueness_of :user_id

    validates_presence_of :course
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

    GRADES = [
      'Pre-K'.freeze,
      'Kindergarten'.freeze,
      *(1..12).map {|n| "Grade #{n}".freeze},
      'Community college, college, or university',
      'Participants in a tech bootcamp or professional development program'
    ].freeze

    HOW_HEARD_FACILITATOR = 'A Code.org facilitator (please share name):'
    HOW_HEARD_CODE_ORG_STAFF = 'A Code.org staff member (please share name):'
    HOW_HEARD_REGIONAL_PARTNER = 'A Code.org Regional Partner (please share name):'

    PROGRAMS = {
      csf: 'CS Fundamentals (Pre-K - 5th grade)',
      csd: 'CS Discoveries (6 - 10th grade)',
      csp: 'CS Principles (9 - 12th grade)'
    }.freeze
    PROGRAM_OPTIONS = PROGRAMS.values

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
          OTHER_WITH_TEXT
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
          OTHER_WITH_TEXT
        ],

        diversity_training: [YES, NO],

        how_heard: [
          'Code.org email',
          'Code.org social media post',
          HOW_HEARD_FACILITATOR,
          HOW_HEARD_CODE_ORG_STAFF,
          HOW_HEARD_REGIONAL_PARTNER,
          'My employer',
          OTHER_WITH_TEXT
        ],

        program: PROGRAM_OPTIONS,

        plan_on_teaching: [
          YES,
          NO,
          "I don’t know yet",
          OTHER_WITH_TEXT
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
          "I'm not available for either TeacherCon. (Please Explain):"
        ],

        csd_csp_fit_availability: [
          'June 23 - 24, 2018 (immediately following TeacherCon 1)',
          'July 28 - 29, 2018 (immediately following TeacherCon 2)',
          "I'm not available for either Facilitator-in-Training workshop. (Please Explain):"
        ],

        led_cs_extracurriculars: [
          'Hour of Code',
          'After-school or lunchtime computer science clubs',
          'Computer science-focused summer camps',
          OTHER_PLEASE_LIST
        ],

        teaching_experience: [YES, NO],

        grades_taught: [
          *GRADES,
          OTHER_WITH_TEXT
        ],

        grades_currently_teaching: [
          *GRADES,
          OTHER_WITH_TEXT,
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
          OTHER_WITH_TEXT
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
          OTHER_WITH_TEXT,
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
        [:how_heard, HOW_HEARD_FACILITATOR, :how_heard_facilitator],
        [:how_heard, HOW_HEARD_CODE_ORG_STAFF, :how_heard_code_org_staff],
        [:how_heard, HOW_HEARD_REGIONAL_PARTNER, :how_heard_regional_partner],
        [:how_heard],
        [:plan_on_teaching],
        [:led_cs_extracurriculars, OTHER_PLEASE_LIST],
        [:grades_taught],
        [:grades_currently_teaching],
        [:subjects_taught],
        [:experience_leading]
      ]
    end

    # @override
    # Filter out extraneous answers, based on selected program (course)
    def self.filtered_labels(course)
      labels_to_remove = (course == 'csf' ?
        [:csd_csp_fit_availability, :csd_csp_teachercon_availability]
        : # csd / csp
        [:csf_availability, :csf_partial_attendance_reason]
      )

      ALL_LABELS_WITH_OVERRIDES.except(*labels_to_remove)
    end

    # @override
    def self.csv_header(course)
      # strip all markdown formatting out of the labels
      markdown = Redcarpet::Markdown.new(Redcarpet::Render::StripDown)
      CSV.generate do |csv|
        columns = filtered_labels(course).values.map {|l| markdown.render(l)}
        columns.push 'Status', 'Locked', 'Notes', 'Regional Partner'
        csv << columns
      end
    end

    # @override
    def to_csv_row
      answers = full_answers
      CSV.generate do |csv|
        row = self.class.filtered_labels(course).keys.map {|k| answers[k]}
        row.push status, locked?, notes, regional_partner_name
        csv << row
      end
    end

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
  end
end
