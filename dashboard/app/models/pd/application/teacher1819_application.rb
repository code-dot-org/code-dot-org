# == Schema Information
#
# Table name: pd_applications
#
#  id                          :integer          not null, primary key
#  user_id                     :integer
#  type                        :string(255)      not null
#  application_year            :string(255)      not null
#  application_type            :string(255)      not null
#  regional_partner_id         :integer
#  status                      :string(255)
#  locked_at                   :datetime
#  notes                       :text(65535)
#  form_data                   :text(65535)      not null
#  created_at                  :datetime         not null
#  updated_at                  :datetime         not null
#  course                      :string(255)
#  response_scores             :text(65535)
#  application_guid            :string(255)
#  accepted_at                 :datetime
#  properties                  :text(65535)
#  deleted_at                  :datetime
#  status_timestamp_change_log :text(65535)
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

module Pd::Application
  class Teacher1819Application < TeacherApplicationBase
    include ::Pd::Teacher1819ApplicationConstants

    has_one :pd_teachercon1819_registration,
      class_name: 'Pd::Teachercon1819Registration',
      foreign_key: 'pd_application_id'

    validates_uniqueness_of :user_id

    serialized_attrs %w(
      auto_assigned_enrollment_id
    )

    # @override
    def year
      YEAR_18_19
    end

    # @override
    def check_idempotency
      Teacher1819Application.find_by(user: user)
    end

    def teachercon_registration
      Pd::Teachercon1819Registration.find_by_pd_application_id(id)
    end

    # @override
    def self.options
      {
        country: [
          'United States',
          'Other country'
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
          'Instructional coach',
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

        how_heard: [
          'Code.org Website',
          'Code.org Email',
          'Regional Partner website',
          'Regional Partner Email',
          'From a teacher that has participated in a Code.org program',
          'From an administrator',
          TEXT_FIELDS[:other_with_text]
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
        ],

        taught_in_past: SUBJECTS_TAUGHT_IN_PAST + [
          TEXT_FIELDS[:other_please_list],
          "I don't have experience teaching any of these courses"
        ]
      }
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
        [:plan_to_teach, TEXT_FIELDS[:dont_know_if_i_will_teach_explain], :plan_to_teach_other],
        [:able_to_attend_single, TEXT_FIELDS[:unable_to_attend], :able_to_attend_single_explain],
        [:able_to_attend_multiple, TEXT_FIELDS[:no_explain], :able_to_attend_multiple_explain],
        [:committed, TEXT_FIELDS[:no_explain], :committed_other]
      ]
    end

    # Called once after the application is submitted, and the principal approval is done
    # Automatically scores the application based on given responses for this and the
    # principal approval application. It is idempotent, and will not override existing
    # scores on this application
    #
    # @override
    def auto_score!
      responses = sanitize_form_data_hash

      scores = {
        regional_partner_name: regional_partner ? YES : NO,
        committed: responses[:committed] == YES ? YES : NO
      }

      if responses[:able_to_attend_single]
        scores[:able_to_attend_single] = able_attend_single_to_yes_no_score(responses[:able_to_attend_single])
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
        scores[:csp_how_offer] = responses[:csp_how_offer] != self.class.options[:csp_how_offer].first ? 2 : 0
        scores[:taught_in_past] = responses[:taught_in_past].none? {|x| x.include? 'AP'} ? 2 : 0
      elsif course == 'csd'
        scores[:csd_which_grades] = (responses[:csd_which_grades].map(&:to_i) & (6..10).to_a).any? ? YES : NO
        scores[:csd_course_hours_per_year] = responses[:csd_course_hours_per_year] != COMMON_OPTIONS[:course_hours_per_year].last ? YES : NO
        scores[:previous_yearlong_cdo_pd] = (responses[:previous_yearlong_cdo_pd] & ['CS Discoveries', 'Exploring Computer Science']).empty? ? YES : NO
        scores[:taught_in_past] = responses[:taught_in_past].include?(self.class.options[:taught_in_past].last) ? 2 : 0
      end

      # Update the hash, but don't override existing scores
      update(response_scores: response_scores_hash.merge(scores) {|_, old_value, _| old_value}.to_json)
    end

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

    def able_attend_single_to_yes_no_score(response)
      if response == TEXT_FIELDS[:able_to_attend_single]
        YES
      elsif response && !response.include?(TEXT_FIELDS[:unable_to_attend])
        NO
      else
        nil
      end
    end

    def self.cohort_csv_header(optional_columns)
      columns = [
        'Date Accepted',
        'Applicant Name',
        'District Name',
        'School Name',
        'Email',
        'Status',
        'Assigned Workshop'
      ]
      if optional_columns[:registered_workshop]
        columns.push 'Registered Workshop'
      end
      if optional_columns[:accepted_teachercon]
        columns.push 'Accepted Teachercon'
      end

      CSV.generate do |csv|
        csv << columns
      end
    end

    # @override
    def self.csv_header(course, user)
      markdown = Redcarpet::Markdown.new(Redcarpet::Render::StripDown)
      CSV.generate do |csv|
        columns = filtered_labels(course).values.map {|l| markdown.render(l)}.map(&:strip)
        columns.push(
          'Principal Approval',
          'Principal Approval Form',
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
          'Date Submitted',
          'Notes',
          'Status'
        )
        columns.push('Locked') if can_see_locked_status?(user)
        csv << columns
      end
    end

    # @override
    def meets_criteria
      response_scores = response_scores_hash
      scored_questions =
        if course == 'csd'
          CRITERIA_SCORE_QUESTIONS_CSD.dup
        elsif course == 'csp'
          CRITERIA_SCORE_QUESTIONS_CSP.dup
        end

      if response_scores[:able_to_attend_single] && !response_scores[:able_to_attend_multiple]
        scored_questions.delete(:able_to_attend_multiple)
      elsif response_scores[:able_to_attend_multiple] && !response_scores[:able_to_attend_single]
        scored_questions.delete(:able_to_attend_single)
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

    # @override
    def to_csv_row(user)
      answers = full_answers
      CSV.generate do |csv|
        row = self.class.filtered_labels(course).keys.map {|k| answers[k]}
        row.push(
          principal_approval_state,
          principal_approval_url,
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
          created_at.to_date.iso8601,
          notes,
          status
        )
        row.push locked? if self.class.can_see_locked_status?(user)
        csv << row
      end
    end

    def to_cohort_csv_row(optional_columns)
      columns = [
        date_accepted,
        applicant_name,
        district_name,
        school_name,
        user.email,
        status,
        workshop_date_and_location
      ]
      if optional_columns[:registered_workshop]
        if workshop.try(:local_summer?)
          columns.push(registered_workshop? ? 'Yes' : 'No')
        else
          columns.push nil
        end
      end
      if optional_columns[:accepted_teachercon]
        if workshop.try(:teachercon?)
          columns.push(pd_teachercon1819_registration ? 'Yes' : 'No')
        else
          columns.push nil
        end
      end

      CSV.generate do |csv|
        csv << columns
      end
    end

    # memoize in a hash, per course
    FILTERED_LABELS = Hash.new do |h, key|
      labels_to_remove = (
      if key == 'csd'
        [
          :csp_which_grades,
          :csp_course_hours_per_week,
          :csp_course_hours_per_year,
          :csp_terms_per_year,
          :csp_how_offer,
          :csp_ap_exam
        ]
      else
        [
          :csd_which_grades,
          :csd_course_hours_per_week,
          :csd_course_hours_per_year,
          :csd_terms_per_year
        ]
      end
      )

      # school contains NCES id
      # the other fields are empty in the form data unless they selected "Other" school,
      # so we add it when we construct the csv row.
      labels_to_remove.push(:school, :school_name, :school_address, :school_type, :school_city, :school_state, :school_zip_code)

      h[key] = ALL_LABELS_WITH_OVERRIDES.except(*labels_to_remove)
    end

    # @override
    # Filter out extraneous answers based on selected program (course)
    def self.filtered_labels(course)
      raise "Invalid course #{course}" unless VALID_COURSES.include?(course)
      FILTERED_LABELS[course]
    end

    # @override
    def self.can_see_locked_status?(user)
      user && (user.workshop_admin? || user.regional_partners.first.try(&:group) == 3)
    end
  end
end
