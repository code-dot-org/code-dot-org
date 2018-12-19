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
  class Facilitator1920Application < FacilitatorApplicationBase
    include Pd::Facilitator1920ApplicationConstants

    validates_uniqueness_of :user_id

    has_one :pd_fit_weekend1920_registration,
      class_name: 'Pd::FitWeekend1920Registration',
      foreign_key: 'pd_application_id'

    #override
    def year
      YEAR_19_20
    end

    # Are we still accepting applications?
    APPLICATION_CLOSE_DATE = Date.new(2019, 2, 1)
    def self.open?
      Time.zone.now < APPLICATION_CLOSE_DATE
    end

    # Queries for locked and (accepted or withdrawn) and assigned to a fit workshop
    # @param [ActiveRecord::Relation<Pd::Application::Facilitator1920Application>] applications_query
    #   (optional) defaults to all
    # @note this is not chainable since it inspects fit_workshop_id from serialized attributes,
    #   which must be done in the model.
    # @return [array]
    def self.fit_cohort(applications_query = all)
      applications_query.
        where(type: name).
        where(status: [:accepted, :withdrawn]).
        where.not(locked_at: nil).
        includes(:pd_fit_weekend1920_registration).
        select(&:fit_workshop_id?)
    end

    # @override
    def check_idempotency
      Pd::Application::Facilitator1920Application.find_by(user: user)
    end

    def fit_weekend_registration
      Pd::FitWeekend1920Registration.find_by_pd_application_id(id)
    end

    # memoize in a hash, per course
    FILTERED_LABELS ||= Hash.new do |h, key|
      labels_to_remove = key == 'csf' ?
        [:csd_csp_fit_availability, :csd_csp_teachercon_availability]
        : # csd / csp
        [:csf_availability, :csf_partial_attendance_reason]

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
        columns.push(
          'Status',
          'Locked',
          'Notes',
          'Notes 2',
          'Notes 3',
          'Notes 4',
          'Notes 5',
          'Regional Partner'
        )
        csv << columns
      end
    end

    def self.cohort_csv_header(optional_columns)
      columns = [
        'Date Accepted',
        'Name',
        'School District',
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

      columns.push(
        'Notes',
        'Notes 2',
        'Notes 3',
        'Notes 4',
        'Notes 5'
      )

      CSV.generate do |csv|
        csv << columns
      end
    end

    # @override
    def to_csv_row(user)
      answers = full_answers
      CSV.generate do |csv|
        row = self.class.filtered_labels(course).keys.map {|k| answers[k]}
        row.push(
          status,
          locked?,
          notes,
          notes_2,
          notes_3,
          notes_4,
          notes_5,
          regional_partner_name
        )
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
        fit_workshop_date_and_location
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

      columns.push(
        notes,
        notes_2,
        notes_3,
        notes_4,
        notes_5
      )

      CSV.generate do |csv|
        csv << columns
      end
    end
  end
end
