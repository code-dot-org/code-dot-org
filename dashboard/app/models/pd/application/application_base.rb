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

# Base class for the Pd application forms.
# Make sure to use a derived class for a specific application type and year.
# This on its own will fail validation.
module Pd::Application
  class ApplicationBase < ActiveRecord::Base
    include ApplicationConstants
    include Pd::Form

    OTHER = 'Other'.freeze
    OTHER_WITH_TEXT = 'Other:'.freeze
    YES = 'Yes'.freeze
    NO = 'No'.freeze
    NONE = 'None'.freeze
    INCOMPLETE = 'Incomplete'.freeze

    COMMON_OPTIONS = {
      title: %w(Mr. Mrs. Ms. Dr.),

      state: get_all_states_with_dc.to_h.values,

      gender_identity: [
        'Female',
        'Male',
        OTHER,
        'Prefer not to answer'
      ],

      race: [
        'White',
        'Black or African American',
        'Hispanic or Latino',
        'Asian',
        'Native Hawaiian or other Pacific Islander',
        'American Indian/Alaska Native',
        OTHER,
        'Prefer not to say'
      ],

      course_hours_per_year: [
        'At least 100 course hours',
        '50 to 99 course hours',
        'Less than 50 course hours'
      ],

      terms_per_year: [
        '1 quarter',
        '1 trimester',
        '1 semester',
        '2 trimesters',
        'Full year'
      ],
      school_type: [
        'Public school',
        'Private school',
        'Charter school',
        'Other'
      ]
    }

    after_initialize -> {self.status = :unreviewed}, if: :new_record?
    before_create -> {self.status = :unreviewed}
    after_initialize :set_type_and_year
    before_validation :set_type_and_year
    before_save :update_accepted_date, if: :status_changed?
    before_create :generate_application_guid, if: -> {application_guid.blank?}

    def set_type_and_year
      # Override in derived classes and set to valid values.
      # Setting them to nil here fails those validations and prevents this base class from being saved.
      self.application_year = nil
      self.application_type = nil
    end

    def update_accepted_date
      self.accepted_at = status == 'accepted' ? Time.now : nil
    end

    self.table_name = 'pd_applications'

    enum status: %w(
      unreviewed
      pending
      accepted
      declined
      waitlisted
      withdrawn
      interview
    ).index_by(&:to_sym).freeze

    enum course: %w(
      csf
      csd
      csp
    ).index_by(&:to_sym).freeze

    COURSE_NAME_MAP = {
      csp: Pd::Workshop::COURSE_CSP,
      csd: Pd::Workshop::COURSE_CSD,
      csf: Pd::Workshop::COURSE_CSF
    }

    belongs_to :user
    belongs_to :regional_partner

    validates_presence_of :user_id, unless: proc {|application| application.application_type == PRINCIPAL_APPROVAL_APPLICATION}
    validates_inclusion_of :application_type, in: APPLICATION_TYPES
    validates_inclusion_of :application_year, in: APPLICATION_YEARS
    validates_presence_of :type
    validates_presence_of :status, unless: proc {|application| application.application_type == PRINCIPAL_APPROVAL_APPLICATION}

    # decision notifications should be sent to applications that have been
    # locked but have not yet received a decision_notification email
    scope :should_send_decision_notification_emails, -> {where("locked_at IS NOT NULL AND decision_notification_email_sent_at IS NULL")}

    # Override in derived class
    def send_decision_notification_email
      # intentional noop
    end

    def self.send_all_decision_notification_emails
      # Collect errors, but do not stop batch. Rethrow all errors below.
      errors = []
      should_send_decision_notification_emails.each do |application|
        begin
          application.send_decision_notification_email
        rescue => e
          errors << "failed to send notification for application #{application.id} - #{e.message}"
        end
      end
      raise "Failed to send decision notifications: #{errors.join(', ')}" unless errors.empty?
    end

    # Override in derived class, if relevant, to specify which multiple choice answers
    # have additional text fields, e.g. "Other (please specify): ______"
    # @return [Array<Array>] - list of fields with additional text. Each field is specified as an array of
    #         params to send to #answer_with_additional_text. See that description for more details.
    # @example
    #         [
    #           # Simple - this maps `field1_other` to the "Other:" option in field1's answer
    #           [:field1],
    #
    #           # Complex - this maps `field2_custom` to the "Custom answer:" option in field2's answer
    #           [:field2, "Custom answer", :field2_custom]
    #         ]
    def additional_text_fields
      []
    end

    # Override in derived class to provide headers
    # @param course [String] course name used to choose fields, since they differ between courses
    # @param user [User] requesting user - used to handle field visibility differences
    # @return [String] csv text row of column headers, ending in a newline
    def self.csv_header(course, user)
      raise 'Abstract method must be overridden by inheriting class'
    end

    # Override in derived class to provide the relevant csv data
    # @param user [User] requesting user - used to handle field visibility differences
    # @return [String] csv text row of values, ending in a newline
    #         The order of fields must be consistent between this and #self.csv_header
    def to_csv_row(user)
      raise 'Abstract method must be overridden by inheriting class'
    end

    # Override in derived class to provide csv data for cohort view
    # @return [String] csv text row of values for cohort view ending in newline
    #         The order of fields must be consistent between this and #self.cohort_csv_header
    def to_cohort_csv_row
      raise 'Abstract method must be overridden by inheriting class'
    end

    # Get the answers from form_data with additional text appended
    # @param [Hash] hash - sanitized form data hash (see #sanitize_form_data_hash)
    # @param [Symbol] field_name - name of the multi-choice option
    # @param [String] option (optional, defaults to "Other:") value for the option that is associated with additional text
    # @param [Symbol] additional_text_field_name (optional, defaults to field_name + "_other")
    #                 Field name for the additional text field associated with this option.
    # @returns [String, Array] - adjusted string or array of user response(s) with additional text appended in place
    def self.answer_with_additional_text(hash, field_name, option = OTHER_WITH_TEXT, additional_text_field_name = nil)
      additional_text_field_name ||= "#{field_name}_other".to_sym
      answer = hash[field_name]
      if answer.is_a? String
        answer = [option, hash[additional_text_field_name]].flatten.join(' ') if answer == option
      elsif answer.is_a? Array
        index = answer.index(option)
        answer[index] = [option, hash[additional_text_field_name]].flatten.join(' ') if index
      end

      answer
    end

    def self.filtered_labels(course)
      raise 'Abstract method must be overridden in base class'
    end

    def self.can_see_locked_status?(user)
      true
    end

    # Include additional text for all the multi-select fields that have the option
    def full_answers
      @full_answers ||= begin
        sanitize_form_data_hash.tap do |hash|
          additional_text_fields.each do |field_name, option, additional_text_field_name|
            next unless hash.key? field_name

            option ||= OTHER_WITH_TEXT
            additional_text_field_name ||= "#{field_name}_other".to_sym
            hash[field_name] = self.class.answer_with_additional_text hash, field_name, option, additional_text_field_name
            hash.delete additional_text_field_name
          end
        end.slice(*self.class.filtered_labels(course).keys)
      end
    end

    # Camelized (js-standard) format of the full_answers. The keys here will match the raw keys in form_data
    def full_answers_camelized
      @full_answers_camelized ||=
        full_answers.transform_keys {|k| k.to_s.camelize(:lower)}
    end

    def clear_memoized_values
      super
      @full_answers = nil
      @full_answers_camelized = nil
    end

    def generate_application_guid
      self.application_guid = SecureRandom.uuid
    end

    def locked?
      locked_at.present?
    end

    def lock!
      return if locked?
      update! locked_at: Time.zone.now
    end

    def unlock!
      return unless locked?
      update! locked_at: nil
    end

    def email
      user.try(:email) || sanitize_form_data_hash[:alternate_email]
    end

    def regional_partner_name
      regional_partner.try(:name)
    end

    def school_name
      user.try(:school_info).try(:effective_school_name).try(:titleize)
    end

    def district_name
      user.try(:school_info).try(:effective_school_district_name).try(:titleize)
    end

    def applicant_name
      "#{sanitize_form_data_hash[:first_name]} #{sanitize_form_data_hash[:last_name]}"
    end

    # Convert responses cores to a hash of underscore_cased symbols
    def response_scores_hash
      JSON.parse(response_scores || '{}').transform_keys {|key| key.underscore.to_sym}
    end

    def total_score
      numeric_scores = response_scores_hash.values.select do |score|
        score.is_a?(Numeric) || score =~ /^\d+$/
      end
      numeric_scores.map(&:to_i).reduce(:+)
    end

    def course_name
      COURSE_NAME_MAP[course.to_sym]
    end

    # displays the iso8601 date (yyyy-mm-dd)
    def date_accepted
      accepted_at.try {|datetime| datetime.to_date.iso8601}
    end
  end
end
