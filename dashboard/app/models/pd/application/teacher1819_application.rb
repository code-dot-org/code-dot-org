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

    validates_uniqueness_of :user_id

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
