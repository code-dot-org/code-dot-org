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
require 'services/international_opt_in/partner_data_loader'
require 'services/international_opt_in/school_data/colombia'
require 'services/international_opt_in/school_data/chile'
require 'services/international_opt_in/school_data/uzbekistan'

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
    case hash[:school_country]
    when 'Colombia' then Services::InternationalOptIn::SchoolData::Colombia.required_fields
    when 'Chile' then Services::InternationalOptIn::SchoolData::Chile.required_fields
    when 'Uzbekistan'then Services::InternationalOptIn::SchoolData::Uzbekistan.required_fields
    else %i[school_city]
    end
  end

  def email_opt_in?
    sanitized_form_data_hash[:email_opt_in].casecmp?("yes")
  end

  ## Class Methods
  def self.options
    entry_keys = {
      schoolCountry: Services::InternationalOptIn::PartnerDataLoader.partners.keys.map(&:to_s).sort,
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

    entries[:colombianSchoolData] = colombia_school_data
    entries[:chileanSchoolData] = chile_school_data
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

  def self.partner_entries
    Services::InternationalOptIn::PartnerDataLoader.partner_entries
  end

  def self.colombia_school_data
    Services::InternationalOptIn::SchoolData::Colombia.data
  end

  def self.chile_school_data
    Services::InternationalOptIn::SchoolData::Chile.data
  end

  def self.uzbekistan_school_data
    Services::InternationalOptIn::SchoolData::Uzbekistan.data
  end
end
