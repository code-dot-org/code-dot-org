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

# Base class for the Pd application forms.
# Make sure to use a derived class for a specific application type and year.
# This on its own will fail validation.
module Pd::Application
  class ApplicationBase < ActiveRecord::Base
    include ApplicationConstants
    include Pd::Form

    OTHER = 'Other'.freeze
    OTHER_WITH_TEXT = 'Other:'.freeze
    OTHER_PLEASE_EXPLAIN = 'Other (Please Explain):'.freeze
    OTHER_PLEASE_LIST = 'Other (Please List):'
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

    def set_type_and_year
      # Override in derived classes and set to valid values.
      # Setting them to nil here fails those validations and prevents this base class from being saved.
      self.application_year = nil
      self.application_type = nil
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
      should_send_decision_notification_emails.each(&:send_decision_notification_email)
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
    # @return [String] csv text row of column headers, ending in a newline
    def self.csv_header
      raise 'Abstract method must be overridden by inheriting class'
    end

    # Override in derived class to provide the relevant csv data
    # @return [String] csv text row of values, ending in a newline
    #         The order of fields must be consistent between this and #self.csv_header
    def to_csv_row
      raise 'Abstract method must be overridden by inheriting class'
    end

    # Get the answers from form_data with additional text appended
    # @param [Hash] hash - sanitized form data hash (see #sanitize_form_data_hash)
    # @param [Symbol] field_name - name of the multi-choice option
    # @param [String] option (optional, defaults to "Other:") value for the option that is associated with additional text
    # @param [Symbol] additional_text_field_name (optional, defaults to field_name + "_other")
    #                 Field name for the additional text field associated with this option.
    # @returns [Array] - adjusted array of user responses with additional text appended in place
    def answer_with_additional_text(hash, field_name, option = OTHER_WITH_TEXT, additional_text_field_name = nil)
      additional_text_field_name ||= "#{field_name}_other".to_sym
      hash[field_name].tap do |answer|
        if answer
          index = answer.index(option)
          if index
            answer[index] = [option, hash[additional_text_field_name.to_sym]].flatten.join(' ')
          end
        end
      end
    end

    def self.filtered_labels(course)
      raise 'Abstract method must be overridden in base class'
    end

    # Include additional text for all the multi-select fields that have the option
    def full_answers
      sanitize_form_data_hash.tap do |hash|
        additional_text_fields.each do |additional_text_field|
          answer_with_additional_text hash, *additional_text_field
        end
      end.slice(*self.class.filtered_labels(course).keys)
    end

    # Camelized (js-standard) format of the full_answers. The keys here will match the raw keys in form_data
    def full_answers_camelized
      full_answers.transform_keys {|k| k.to_s.camelize(:lower)}
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
      response_scores_hash.values.map {|x| x.try(:to_i)}.compact.reduce(:+)
    end

    protected

    def include_additional_text(hash, field_name, *options)
      hash[field_name] = answer_with_additional_text hash, field_name, *options
    end
  end
end
