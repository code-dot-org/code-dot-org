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

class Pd::InternationalOptIn < ApplicationRecord
  include Pd::Form
  include InternationalOptInPeople

  COLOMBIAN_SCHOOL_DATA = JSON.parse(
    File.read(
      File.join(Rails.root, 'config', 'colombianSchoolData.json')
    )
  ).freeze

  CHILEAN_SCHOOL_DATA = JSON.parse(
    File.read(
      File.join(Rails.root, 'config', 'chileanSchoolData.json')
    )
  ).freeze

  UZBEKISTAN_SCHOOL_DATA = JSON.parse(
    File.read(
      File.join(Rails.root, 'config', 'uzbekistanSchoolData.json')
    )
  ).freeze

  belongs_to :user

  validates_presence_of :form_data

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

  def validate_with(options)
    # Because we're using the special "answerText/answerValue" format in
    # self.options, we need to normalize to just answerValue here for
    # validation.
    normalized_options = options.map do |key, values|
      normalized_values = values.map do |value|
        return value.fetch(:answerValue, nil) if value.is_a? Hash
        value
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

  def self.options
    entry_keys = {
      schoolCountry: %w(australia barbados belize brazil canada chile colombia dominican_republic india indonesia israel jamaica kenya malaysia maldives mexico mongolia new_zealand paraguay portugal slovakia south_korea spain thailand trinidad_and_tobago uzbekistan vietnam),
      workshopCourse: %w(csf_af csf_express csd csp csa other not_applicable),
      emailOptIn: %w(opt_in_yes opt_in_no),
      legalOptIn: %w(opt_in_yes opt_in_no)
    }

    # Convert all entry keys to objects which define the form value and display
    # text (in this case, _translated_ display text) separately.
    #
    # See the definition of the "Answer" object in
    # apps/src/code-studio/pd/form_components/utils.js
    entries = Hash[entry_keys.map do |key, values|
      [key, values.map do |value|
        {
          answerText: I18n.t("pd.form_entries.#{key.to_s.underscore}.#{value.underscore}"),
          answerValue: value
        }
      end]
    end]

    entries[:workshopOrganizer] = INTERNATIONAL_OPT_IN_PARTNERS

    entries[:colombianSchoolData] = COLOMBIAN_SCHOOL_DATA
    entries[:chileanSchoolData] = CHILEAN_SCHOOL_DATA
    entries[:uzbekistanSchoolData] = UZBEKISTAN_SCHOOL_DATA

    super.merge(entries)
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

  def email_opt_in?
    sanitized_form_data_hash[:email_opt_in].casecmp?("yes")
  end

  def email
    sanitized_form_data_hash[:email]
  end
end
