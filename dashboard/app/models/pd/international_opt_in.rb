# == Schema Information
#
# Table name: pd_international_opt_ins
#
#  id         :integer          not null, primary key
#  user_id    :integer          not null
#  form_data  :text(65535)      not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_pd_international_opt_ins_on_user_id  (user_id)
#
require 'json'
require 'cdo/honeybadger'

class Pd::InternationalOptIn < ApplicationRecord
  include Pd::Form

  belongs_to :user

  validates :form_data, presence: true

  ## Instance Methods
  def email
    sanitized_form_data_hash[:email]
  end

  def validate_with(options)
    # Because we're using the special "answerText/answerValue" format in
    # self.options, we need to normalize to just answerValue here for
    # validation.
    normalized_options = options.map do |key, values|
      normalized_values = values.map do |value|
        value.is_a?(Hash) ? value.fetch(:answerValue, nil) : value
      end
      [key, normalized_values]
    end.to_h
    super(normalized_options)
  end

  def validate_required_fields
    super

    # Check that the workshop date provided is actually a date.
    begin
      Date.parse(form_data_hash['date']) if form_data_hash['date'].present?
    rescue ArgumentError
      errors.add(:form_data, :invalid)
    end
  end

  # @override
  def dynamic_required_fields(hash)
    [].tap do |required|
      case hash[:school_country]
      when 'Colombia'
        required << :school_department
        required << :school_municipality
        required << :school_city
      when 'Chile'
        required << :school_department
        required << :school_commune
        required << :school_id
      when 'Uzbekistan'
        required << :school_department
        required << :school_municipality
      else
        required << :school_city
      end
    end
  end

  def email_opt_in?
    sanitized_form_data_hash[:email_opt_in].casecmp?("yes")
  end

  ## Class Methods
  def self.options
    entry_keys = {
      schoolCountry: international_partners.keys.map(&:to_s).sort,
      workshopCourse: %w(csf_af csf_express csd csp csa other not_applicable),
      emailOptIn: %w(opt_in_yes opt_in_no),
      legalOptIn: %w(opt_in_yes opt_in_no)
    }

    # Convert all entry keys to objects which define the form value and display
    # text (in this case, _translated_ display text) separately.
    #
    # See the definition of the "Answer" object in
    # apps/src/code-studio/pd/form_components/utils.js
    entries = entry_keys.map do |key, values|
      [key, values.map do |value|
        # Capitalize country values to be consistent with other country strings in our database
        answer = key.to_s == 'schoolCountry' ? value.titleize : value
        {
          answerText: I18n.t("pd.form_entries.#{key.to_s.underscore}.#{value.underscore}"),
          answerValue: answer
        }
      end]
    end.to_h

    entries[:workshopOrganizer] = partner_entries

    entries[:colombianSchoolData] = colombian_school_data
    entries[:chileanSchoolData] = chilean_school_data
    entries[:uzbekistanSchoolData] = uzbekistan_school_data

    super.merge(entries)
  end

  def self.labels
    keys = %w(
      firstName
      firstNamePreferred
      lastName
      email
      school
      schoolCity
      schoolCityDistrict
      schoolCountry
      schoolDepartmentRegion
      schoolName
      workshopOrganizer
      workshopCourse
      emailOptIn
      legalOptIn
    )

    # Colombia and Chile have some specialized school categorization logic, so we
    # provide some custom labels.
    keys += %w(
      colombianSchoolCity
      colombianChileanSchoolDepartment
      colombianSchoolMunicipality
      colombianChileanSchoolName
      chileanSchoolCommune
      chileanSchoolId
    )

    keys.index_with {|v| I18n.t("pd.form_labels.#{v.underscore}")}
  end

  def self.required_fields
    [
      :first_name,
      :last_name,
      :school_name,
      :school_country,
      :date,
      :workshop_organizer,
      :workshop_course,
      :email_opt_in,
      :legal_opt_in
    ]
  end

  def self.international_partners
    @international_partners ||= load_json('international_partners_data.json')
  end

  def self.partner_entries
    international_partners.transform_values do |partner_list|
      partner_list + [I18n.t('pd.international_opt_in.organizer_not_listed')]
    end
  end

  def self.colombian_school_data
    @colombian_school_data ||= load_json('colombian_school_data.json')
  end

  def self.chilean_school_data
    @chilean_school_data ||= load_json('chilean_school_data.json')
  end

  def self.uzbekistan_school_data
    @uzbekistan_school_data ||= load_json('uzbekistan_school_data.json')
  end

  def self.load_json(filename)
    JSON.parse(File.read(Rails.root.join('config', 'international_opt_in', filename))).freeze
  rescue Errno::ENOENT, JSON::ParserError => exception
    Honeybadger.notify(
      exception,
      error_message: "Error loading JSON for #{filename}: #{exception.message}"
    )
  end

  private_class_method :load_json
end
