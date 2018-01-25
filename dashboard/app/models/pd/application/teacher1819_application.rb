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
  class Teacher1819Application < WorkshopAutoenrolledApplication
    include Rails.application.routes.url_helpers
    include Teacher1819ApplicationConstants
    include RegionalPartnerTeacherconMapping
    include SchoolInfoDeduplicator

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

    # Updates the associated user's school info with the info from this teacher application
    # based on these rules in order:
    # 1. Application has a specific school? always overwrite the user's school info
    # 2. User doesn't have a specific school? overwrite with the custom school info.
    def update_user_school_info!
      if school_id || user.school_info.try(&:school).nil?
        school_info = get_duplicate_school_info(school_info_attr) || SchoolInfo.create!(school_info_attr)
        user.update_column(:school_info_id, school_info.id)
      end
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

    before_save :save_partner, if: -> {form_data_changed? && regional_partner_id.nil?}
    def save_partner
      self.regional_partner_id = sanitize_form_data_hash[:regional_partner_id]
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
      TEXT_FIELDS[:other_please_list]
    ]

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
          TEXT_FIELDS[:other_please_list]
        ],

        grades_at_school: GRADES,
        grades_teaching: [
          *GRADES,
          TEXT_FIELDS[:not_teaching_this_year],
          TEXT_FIELDS[:other_please_explain]
        ],
        grades_expect_to_teach: [
          *GRADES,
          TEXT_FIELDS[:not_teaching_next_year],
          TEXT_FIELDS[:other_please_explain]
        ],

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
          TEXT_FIELDS[:other_please_list]
        ],

        taught_in_past: [
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
          TEXT_FIELDS[:other_please_list],
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
          TEXT_FIELDS[:other_please_list],
          'No computer science courses are offered at my school'
        ],

        cs_opportunities_at_school: [
          'Courses for credit',
          'After school clubs',
          'Lunch clubs',
          'Hour of Code',
          'No computer science opportunities are currently available at my school',
          TEXT_FIELDS[:other_with_text]
        ],

        program: PROGRAM_OPTIONS,

        csd_which_grades: (6..12).map(&:to_s),

        csd_course_hours_per_week: [
          '5 or more course hours per week',
          '4 to less than 5 course hours per week',
          '3 to less than 4 course hours per week',
          'Less than 3 course hours per week',
          TEXT_FIELDS[:other_please_list]
        ],

        csd_course_hours_per_year: COMMON_OPTIONS[:course_hours_per_year],

        csd_terms_per_year: COMMON_OPTIONS[:terms_per_year],

        csp_which_grades: (6..12).map(&:to_s),

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
          TEXT_FIELDS[:dont_know_if_i_will_teach_explain]
        ],

        pay_fee: [
          'Yes, my school or I will be able to pay the full summer workshop program fee.',
          TEXT_FIELDS[:no_pay_fee],
          'Not applicable: there is no fee for the summer workshop for teachers in my region.'
        ],

        committed: [
          YES,
          'No (Please Explain):'
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
      pd_workshop_id ? Pd::Workshop.find(pd_workshop_id).date_and_location_name : ''
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
        committed: responses[:committed] == YES ? YES : NO
      }

      if responses[:able_to_attend_single]
        scores[:able_to_attend_single] = yes_no_response_to_yes_no_score(responses[:able_to_attend_single])
      elsif responses[:able_to_attend_multiple]
        scores[:able_to_attend_multiple] = able_attend_multiple_to_yes_no_score(responses[:able_to_attend_multiple])
      end

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
        scores[:csp_how_offer] = responses[:csp_how_offer] != Pd::Application::Teacher1819Application.options[:csp_how_offer].first ? 2 : 0
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
        [:current_role, TEXT_FIELDS[:other_please_list]],
        [:grades_teaching, TEXT_FIELDS[:not_teaching_this_year], :grades_teaching_not_teaching_explanation],
        [:grades_teaching, TEXT_FIELDS[:other_please_explain], :grades_teaching_other],
        [:grades_expect_to_teach, TEXT_FIELDS[:not_teaching_next_year], :grades_expect_to_teach_not_expecting_to_teach_explanation],
        [:grades_expect_to_teach, TEXT_FIELDS[:other_please_explain], :grades_expect_to_teach_other],
        [:subjects_teaching, TEXT_FIELDS[:other_please_list]],
        [:subjects_expect_to_teach, TEXT_FIELDS[:other_please_list]],
        [:subjects_licensed_to_teach, TEXT_FIELDS[:other_please_list]],
        [:taught_in_past, TEXT_FIELDS[:other_please_list]],
        [:cs_offered_at_school, TEXT_FIELDS[:other_please_list]],
        [:cs_opportunities_at_school, TEXT_FIELDS[:other_please_list]],
        [:csd_course_hours_per_week, TEXT_FIELDS[:other_please_list]],
        [:plan_to_teach, TEXT_FIELDS[:dont_know_if_i_will_teach_explain], :plan_to_teach_dont_know_explain],
        [:able_to_attend_single, TEXT_FIELDS[:unable_to_attend], :able_to_attend_single_explain],
        [:able_to_attend_multiple, TEXT_FIELDS[:no_explain], :able_to_attend_multiple_explain],
        [:committed, TEXT_FIELDS[:no_explain], :committed_explain]
      ]
    end

    # @override
    # Add account_email (based on the associated user's email) to the sanitized form data hash
    def sanitize_form_data_hash
      super.merge(account_email: user.email)
    end

    def school_id
      raw_school_id = sanitize_form_data_hash[:school]

      # -1 designates custom school info, in which case return nil
      raw_school_id.to_i == -1 ? nil : raw_school_id
    end

    def school_info_attr
      if school_id
        {
          school_id: school_id
        }
      else
        hash = sanitize_form_data_hash
        {
          country: 'US',
          # Take the first word in school type, downcased. E.g. "Public school" -> "public"
          school_type: hash[:school_type].split(' ').first.downcase,
          state: hash[:school_state],
          zip: hash[:school_zip_code],
          school_name: hash[:school_name],
          full_address: hash[:school_address],
          validation_type: SchoolInfo::VALIDATION_NONE
        }
      end
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

    def able_attend_multiple_to_yes_no_score(response)
      response = response.join
      if response.start_with?(TEXT_FIELDS[:no_explain])
        NO
      elsif response && !response.include?(TEXT_FIELDS[:no_explain])
        YES
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
