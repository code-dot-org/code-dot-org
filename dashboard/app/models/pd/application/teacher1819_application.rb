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

require 'cdo/shared_constants/pd/teacher1819_application_constants'

module Pd::Application
  class Teacher1819Application < ApplicationBase
    include Rails.application.routes.url_helpers
    include Teacher1819ApplicationConstants
    include RegionalPartnerTeacherconMapping
    include SerializedProperties

    serialized_attrs %w(
      pd_workshop_id
      auto_assigned_enrollment_id
    )

    def workshop
      Pd::Workshop.find(pd_workshop_id) if pd_workshop_id
    end

    def send_decision_notification_email
      # We only want to email unmatched and G3-matched teachers. All teachers
      # matched with G1 or G2 partners will be emailed by their partners.
      return if regional_partner && regional_partner.group != 3

      # Accepted, declined, and waitlisted are the only valid "final" states;
      # all other states shouldn't need emails
      return unless %w(accepted declined waitlisted).include?(status)

      if status == "accepted"
        # Acceptance emails need to be handled specially, since they not only
        # require an associated workshop but also come in two flavors depending
        # on the nature of the workshop
        return unless pd_workshop_id

        if workshop.teachercon?
          Pd::Application::Teacher1819ApplicationMailer.teachercon_accepted(self).deliver_now
        elsif workshop.local_summer?
          Pd::Application::Teacher1819ApplicationMailer.local_summer_accepted(self).deliver_now
        else
          # Applications should only ever be associated with a workshop that
          # falls into one of the above two categories, but if a mistake was
          # made, notify honeybadger
          Honeybadger.notify(
            error_message: 'Accepted application has invalid workshop',
            context: {
              application_id: id,
              pd_workshop_id: pd_workshop_id,
            }
          )
        end
      else
        Pd::Application::Teacher1819ApplicationMailer.send(status, self).deliver_now
      end
      update!(decision_notification_email_sent_at: Time.zone.now)
    end

    def set_type_and_year
      self.application_year = YEAR_18_19
      self.application_type = TEACHER_APPLICATION
    end

    validates :status, exclusion: {in: ['interview'], message: '%{value} is reserved for facilitator applications.'}

    def self.statuses
      Pd::Application::ApplicationBase.statuses.except('interview')
    end

    validates_uniqueness_of :user_id
    validates_presence_of :course
    before_validation :set_course_from_program
    def set_course_from_program
      self.course = PROGRAMS.key(program)
    end

    before_create :generate_application_guid, if: -> {application_guid.blank?}
    def generate_application_guid
      self.application_guid = SecureRandom.uuid
    end

    before_save :save_partner, if: -> {form_data_changed? && regional_partner_id.nil?}
    def save_partner
      self.regional_partner_id = sanitize_form_data_hash[:regional_partner_id]
    end

    before_save :destroy_autoenrollment, if: -> {status_changed? && status != "accepted"}
    def destroy_autoenrollment
      return unless auto_assigned_enrollment_id

      Pd::Enrollment.find_by(id: auto_assigned_enrollment_id).try(:destroy)
      self.auto_assigned_enrollment_id = nil
    end

    # override
    def lock!
      return if locked?
      super
      enroll_user if status == "accepted"
    end

    def enroll_user
      return unless pd_workshop_id

      enrollment = Pd::Enrollment.where(
        pd_workshop_id: pd_workshop_id,
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

        destroy_autoenrollment
        self.auto_assigned_enrollment_id = enrollment.id
      end
    end

    PROGRAMS = {
      csd: 'Computer Science Discoveries (appropriate for 6th - 10th grade)',
      csp: 'Computer Science Principles (appropriate for 9th - 12th grade, and can be implemented as an AP or introductory course)',
    }.freeze
    PROGRAM_OPTIONS = PROGRAMS.values

    GRADES = [
      'Pre-K'.freeze,
      'Kindergarten'.freeze,
      *(1..12).map {|n| "Grade #{n}".freeze}
    ].freeze

    SUBJECTS_THIS_YEAR = [
      'Computer Science',
      'Computer Literacy',
      'Math',
      'Science',
      'History',
      'Social Studies',
      'English/Language Arts',
      'Music',
      'Art',
      'Multimedia',
      'Foreign Language',
      OTHER_PLEASE_LIST
    ]

    NOT_TEACHING_THIS_YEAR = "I'm not teaching this year (please explain):"
    DONT_KNOW_IF_I_WILL_TEACH_EXPLAIN = "I don't know if I will teach this course (please explain):"
    UNABLE_TO_ATTEND = "No, I'm unable to attend (please explain):"
    NO_EXPLAIN = "No (please explain):"
    def self.options
      {
        country: [
          'United States',
          'International'
        ],

        title: COMMON_OPTIONS[:title],
        state: COMMON_OPTIONS[:state],
        gender_identity: COMMON_OPTIONS[:gender_identity],
        race: COMMON_OPTIONS[:race],

        school_state: COMMON_OPTIONS[:state],
        school_type: COMMON_OPTIONS[:school_type],

        principal_title: COMMON_OPTIONS[:title],

        current_role: [
          'Teacher',
          'Instructional Coach',
          'Librarian',
          'School administrator',
          'District administrator',
          OTHER_PLEASE_LIST
        ],

        grades_at_school: GRADES,
        grades_teaching: [
          *GRADES,
          NOT_TEACHING_THIS_YEAR
        ],
        grades_expect_to_teach: GRADES,

        subjects_teaching: SUBJECTS_THIS_YEAR,
        subjects_expect_to_teach: SUBJECTS_THIS_YEAR,

        does_school_require_cs_license: [
          YES,
          NO,
          "I'm not sure",
        ],

        have_cs_license: [
          YES,
          NO,
          "I'm not sure",
          'Not applicable - My district does not require a specific license, certification, or endorsement to teach computer science.'
        ],

        subjects_licensed_to_teach: [
          'Computer Science',
          'Career and Technical Education',
          'Math',
          'Science',
          'History',
          'Social Studies',
          'English/Language Arts',
          'Music',
          'Art',
          'Multimedia',
          'Foreign Language',
          'Business',
          'Special Education',
          'Physical Education',
          'I am not currently licensed',
          OTHER_PLEASE_LIST
        ],

        taught_in_past: [
          'Hour of Code',
          'CS Fundamentals',
          'CS in Algebra',
          'CS in Science',
          'CS Discoveries',
          'CS Principles (intro or AP-level)',
          'AP CS A',
          'Beauty and Joy of Computing',
          'Code HS',
          'Edhesive',
          'Exploring Computer Science',
          'Mobile CSP',
          'NMSI',
          'Project Lead the Way',
          'Robotics',
          'ScratchEd',
          OTHER_PLEASE_LIST,
          "I don't have experience teaching any of these courses"
        ],

        previous_yearlong_cdo_pd: [
          'CS Discoveries',
          'CS Principles',
          'Exploring Computer Science',
          'CS in Algebra',
          'CS in Science',
          "I haven't participated in a yearlong Code.org Professional Learning Program"
        ],

        cs_offered_at_school: [
          'AP CS A',
          'Beauty and Joy of Computing',
          'Bootstrap',
          'Code HS',
          'Code Monkey',
          'Codesters',
          'CS in Algebra',
          'CS Discoveries',
          'CS Fundamentals',
          'CS Principles (intro or AP-level)',
          'CS in Science',
          'Edhesive',
          'Exploring Computer Science',
          'Globaloria',
          'Hour of Code',
          'Mobile CSP',
          'NMSI',
          'Project Lead the Way',
          'Pythonroom',
          'Robotics',
          'Scalable Game Design',
          'ScratchEd',
          'Tynker',
          'UC Davis C-Stem',
          'UTeach',
          OTHER_PLEASE_LIST,
          'No computer science courses are offered at my school'
        ],

        cs_opportunities_at_school: [
          'Courses for credit',
          'After school clubs',
          'Lunch clubs',
          'Hour of Code',
          'No computer science opportunities are currently available at my school',
          OTHER_WITH_TEXT
        ],

        program: PROGRAM_OPTIONS,

        csd_which_grades: (6..12).map(&:to_s),

        csd_course_hours_per_week: [
          '5 or more course hours per week',
          '4 to less than 5 course hours per week',
          '3 to less than 4 course hours per week',
          'Less than 3 course hours per week',
          OTHER_PLEASE_LIST
        ],

        csd_course_hours_per_year: COMMON_OPTIONS[:course_hours_per_year],

        csd_terms_per_year: COMMON_OPTIONS[:terms_per_year],

        csp_which_grades: (9..12).map(&:to_s),

        csp_course_hours_per_week: [
          'More than 5 course hours per week',
          '4 - 5 course hours per week',
          'Less than 4 course hours per week'
        ],

        csp_course_hours_per_year: COMMON_OPTIONS[:course_hours_per_year],

        csp_terms_per_year: COMMON_OPTIONS[:terms_per_year],

        csp_how_offer: [
          'As an introductory course',
          'As an AP course',
          'We will offer both introductory and AP-level courses'
        ],

        csp_ap_exam: [
          'Yes, all students will be expected to take the AP CS Principles exam',
          "Students will be encouraged to take the exam, but it won't be required",
          "No, I don't plan for my students to take the AP CS Principles exam"
        ],

        plan_to_teach: [
          'Yes, I plan to teach this course',
          'No, someone else from my school will teach this course',
          DONT_KNOW_IF_I_WILL_TEACH_EXPLAIN
        ],

        pay_fee: [
          'Yes, my school or I will be able to pay the full summer workshop program fee.',
          'No, my school or I will not be able to pay the summer workshop program fee.',
          'Not applicable: there is no fee for the summer workshop for teachers in my region.'
        ],

        committed: [
          YES,
          'No (please explain):'
        ],

        willing_to_travel: [
          'Up to 10 miles',
          'Up to 25 miles',
          'Up to 50 miles',
          'Any distance'
        ]
      }
    end

    def self.required_fields
      %i(
        country
        school
        first_name
        last_name
        phone
        address
        city
        state
        zip_code
        gender_identity
        race
        principal_first_name
        principal_last_name
        principal_email
        principal_confirm_email
        principal_phone_number
        current_role
        grades_at_school
        grades_teaching
        grades_expect_to_teach
        subjects_teaching
        subjects_expect_to_teach
        does_school_require_cs_license
        have_cs_license
        subjects_licensed_to_teach
        taught_in_past
        previous_yearlong_cdo_pd
        cs_offered_at_school
        cs_opportunities_at_school
        program
        plan_to_teach
        committed
        willing_to_travel
        agree
      )
    end

    def dynamic_required_fields(hash)
      [].tap do |required|
        if hash[:program] == PROGRAMS[:csd]
          required.concat [
            :csd_which_grades,
            :csd_course_hours_per_week,
            :csd_course_hours_per_year,
            :csd_terms_per_year
          ]
        elsif hash[:program] == PROGRAMS[:csp]
          required.concat [
            :csp_which_grades,
            :csp_course_hours_per_week,
            :csp_course_hours_per_year,
            :csp_terms_per_year,
            :csp_how_offer,
            :csp_ap_exam
          ]
        end
      end
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

    def district_name
      school.try(:school_district).try(:name).try(:titleize)
    end

    def school_name
      school ? school.name.try(:titleize) : sanitize_form_data_hash[:school_name]
    end

    def school_zip_code
      school ? school.zip : sanitize_form_data_hash[:zip_code]
    end

    def school_state
      if school
        school.state.try(:upcase)
      else
        STATE_ABBR_WITH_DC_HASH.key(sanitize_form_data_hash[:state]).try(:to_s)
      end
    end

    def school_city
      school ? school.city.try(:titleize) : sanitize_form_data_hash[:city]
    end

    def school_address
      if school
        address = ""
        [
          school.address_line1,
          school.address_line2,
          school.address_line3
        ].each do |line|
          if line
            address << line << " "
          end
        end
        address.titleize
      else
        sanitize_form_data_hash[:address]
      end
    end

    def school_type
      school ? school.try(:school_type).try(:titleize) : sanitize_form_data_hash[:school_type]
    end

    def first_name
      hash = sanitize_form_data_hash
      hash[:preferred_first_name] || hash[:first_name]
    end

    def last_name
      sanitize_form_data_hash[:last_name]
    end

    def teacher_full_name
      "#{first_name} #{last_name}"
    end

    def state_code
      STATE_ABBR_WITH_DC_HASH.key(state_name).try(:to_s)
    end

    def principal_email
      sanitize_form_data_hash[:principal_email]
    end

    # Title & last name, or full name if no title was provided.
    def principal_greeting
      hash = sanitize_form_data_hash
      title = hash[:principal_title]
      "#{title.present? ? title : hash[:principal_first_name]} #{hash[:principal_last_name]}"
    end

    def principal_approval_url
      pd_application_principal_approval_url(application_guid)
    end

    # @override
    def check_idempotency
      Pd::Application::Teacher1819Application.find_by(user: user)
    end

    def find_default_workshop
      return unless regional_partner

      workshop_course =
        if course == 'csd'
          Pd::Workshop::COURSE_CSD
        elsif course == 'csp'
          Pd::Workshop::COURSE_CSP
        end

      # If this application is associated with a G3 partner who in turn is
      # associated with a specific teachercon, return the workshop for that
      # teachercon
      if regional_partner.group == 3
        teachercon = get_matching_teachercon(regional_partner)
        if teachercon
          return find_teachercon_workshop(course: workshop_course, city: teachercon[:city], year: 2018)
        end
      end

      # Default to just assigning whichever of the partner's eligible workshops
      # is scheduled to start first. We expect to hit this case for G1 and G2
      # partners, and for any G3 partners without an associated teachercon
      regional_partner.
        pd_workshops_organized.
        where(
          course: workshop_course,
          subject: [
            Pd::Workshop::SUBJECT_TEACHER_CON,
            Pd::Workshop::SUBJECT_SUMMER_WORKSHOP
          ]
        ).
        order_by_scheduled_start.
        first
    end

    def meets_criteria
      response_scores = response_scores_hash
      scored_questions =
        if course == 'csd'
          Teacher1819ApplicationConstants::CRITERIA_SCORE_QUESTIONS_CSD
        elsif course == 'csp'
          Teacher1819ApplicationConstants::CRITERIA_SCORE_QUESTIONS_CSP
        end

      responses = scored_questions.map do |key|
        response_scores[key]
      end

      if responses.uniq == [YES]
        # If all resolve to Yes, applicant meets criteria
        YES
      elsif responses.include? NO
        # If any are No, applicant does not meet criteria
        NO
      else
        'Reviewing incomplete'
      end
    end

    def principal_approval
      sanitize_form_data_hash[:principal_approval] || ''
    end

    def date_accepted
      accepted_at.try(:strftime, '%b %e')
    end

    def assigned_workshop
      pd_workshop_id ? Pd::Workshop.find(pd_workshop_id).location_city : ''
    end

    def registered_workshop
      if pd_workshop_id
        Pd::Enrollment.exists?(pd_workshop_id: pd_workshop_id, user: user) ? 'Yes' : 'No'
      else
        ''
      end
    end

    # Called once after the application is submitted, and the principal approval is done
    # Automatically scores the application based on given responses for this and the
    # principal approval application. It is idempotent, and will not override existing
    # scores on this application
    def auto_score!
      responses = sanitize_form_data_hash

      scores = {
        regional_partner_name: regional_partner ? YES : NO,
        committed: responses[:committed] == YES ? YES : NO,
        able_to_attend_single: yes_no_response_to_yes_no_score(responses[:able_to_attend_single])
      }

      if responses[:principal_approval] == YES
        scores.merge!(
          {
            principal_approval: YES,
            schedule_confirmed: yes_no_response_to_yes_no_score(responses[:schedule_confirmed]),
            diversity_recruitment: yes_no_response_to_yes_no_score(responses[:diversity_recruitment]),
            free_lunch_percent: responses[:free_lunch_percent].to_f >= 50 ? 5 : 0,
            underrepresented_minority_percent:  responses[:underrepresented_minority_percent].to_f >= 50 ? 5 : 0,
            wont_replace_existing_course: responses[:wont_replace_existing_course].try(:start_with?, NO) ? 5 : nil,
          }
        )
      elsif responses[:principal_approval] == NO
        scores[:principal_approval] = NO
      end

      if course == 'csp'
        scores[:csp_which_grades] = responses[:csp_which_grades].any? ? YES : NO
        scores[:csp_course_hours_per_year] = responses[:csp_course_hours_per_year] == COMMON_OPTIONS[:course_hours_per_year].first ? YES : NO
        scores[:previous_yearlong_cdo_pd] = responses[:previous_yearlong_cdo_pd].exclude?('CS Principles') ? YES : NO
        scores[:csp_ap_exam] = responses[:csp_ap_exam] != Pd::Application::Teacher1819Application.options[:csp_ap_exam].last ? YES : NO
        scores[:taught_in_past] = responses[:taught_in_past].none? {|x| x.include? 'AP'} ? 2 : 0
      elsif course == 'csd'
        scores[:csd_which_grades] = (responses[:csd_which_grades].map(&:to_i) & (6..10).to_a).any? ? YES : NO
        scores[:csd_course_hours_per_year] = responses[:csd_course_hours_per_year] != COMMON_OPTIONS[:course_hours_per_year].last ? YES : NO
        scores[:previous_yearlong_cdo_pd] = (responses[:previous_yearlong_cdo_pd] & ['CS Discoveries', 'Exploring Computer Science']).empty? ? YES : NO
        scores[:taught_in_past] = responses[:taught_in_past].include?(Pd::Application::Teacher1819Application.options[:taught_in_past].last) ? 2 : 0
      end

      # Update the hash, but don't override existing scores
      update(response_scores: response_scores_hash.merge(scores) {|_, old_value, _| old_value}.to_json)
    end

    # @override
    def self.csv_header(course)
      markdown = Redcarpet::Markdown.new(Redcarpet::Render::StripDown)
      CSV.generate do |csv|
        columns = filtered_labels(course).values.map {|l| markdown.render(l)}.map(&:strip)
        columns.push(
          'Principal Approval',
          'Meets Criteria',
          'Total Score',
          'Regional Partner',
          'School District',
          'School',
          'School Type',
          'School Address',
          'School City',
          'School State',
          'School Zip Code',
          'Notes',
          'Status'
        )
        csv << columns
      end
    end

    # @override
    def self.cohort_csv_header
      CSV.generate do |csv|
        csv << ['Date Accepted', 'Applicant Name', 'District Name', 'School Name',
                'Email', 'Assigned Workshop', 'Registered Workshop']
      end
    end

    # @override
    def to_csv_row
      answers = full_answers
      CSV.generate do |csv|
        row = self.class.filtered_labels(course).keys.map {|k| answers[k]}
        row.push(
          principal_approval,
          meets_criteria,
          total_score,
          regional_partner_name,
          district_name,
          school_name,
          school_type,
          school_address,
          school_city,
          school_state,
          school_zip_code,
          notes,
          status
        )
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
          assigned_workshop,
          registered_workshop
        ]
      end
    end

    # @override
    # Filter out extraneous answers based on selected program (course)
    def self.filtered_labels(course)
      labels_to_remove = (course == 'csd' ?
        [
          :csp_which_grades,
          :csp_course_hours_per_week,
          :csp_course_hours_per_year,
          :csp_terms_per_year,
          :csp_how_offer,
          :csp_ap_exam
        ] : [
          :csd_which_grades,
          :csd_course_hours_per_week,
          :csd_course_hours_per_year,
          :csd_terms_per_year
        ]
      )
      # school contains NCES id
      # the other fields are empty in the form data unless they selected "Other" school,
      # so we add it when we construct the csv row.
      labels_to_remove.push(:school, :school_name, :school_address, :school_type, :school_city, :school_state, :school_zip_code)

      ALL_LABELS_WITH_OVERRIDES.except(*labels_to_remove)
    end

    # @override
    # Include additional text for all the multi-select fields that have the option
    def additional_text_fields
      [
        [:current_role, OTHER_PLEASE_LIST],
        [:grades_teaching, NOT_TEACHING_THIS_YEAR, :grades_teaching_not_teaching_explanation],
        [:subjects_teaching, OTHER_PLEASE_LIST],
        [:subjects_expect_to_teach, OTHER_PLEASE_LIST],
        [:subjects_licensed_to_teach, OTHER_PLEASE_LIST],
        [:taught_in_past, OTHER_PLEASE_LIST],
        [:cs_offered_at_school, OTHER_PLEASE_LIST],
        [:cs_opportunities_at_school, OTHER_PLEASE_LIST],
        [:csd_course_hours_per_week, OTHER_PLEASE_LIST],
        [:plan_to_teach, DONT_KNOW_IF_I_WILL_TEACH_EXPLAIN, :plan_to_teach_dont_know_explain],
        [:able_to_attend_single, UNABLE_TO_ATTEND, :able_to_attend_single_explain],
        [:able_to_attend_multiple, NO_EXPLAIN, :able_to_attend_multiple_explain],
        [:committed, NO_EXPLAIN, :committed_explain]
      ]
    end

    # @override
    # Add account_email (based on the associated user's email) to the sanitized form data hash
    def sanitize_form_data_hash
      super.merge(account_email: user.email)
    end

    protected

    def yes_no_response_to_yes_no_score(response)
      if response == YES
        YES
      elsif response == NO
        NO
      else
        nil
      end
    end

    def school
      school_id = sanitize_form_data_hash[:school]
      if school_id == '-1'
        nil
      else
        School.find(school_id)
      end
    end
  end
end
