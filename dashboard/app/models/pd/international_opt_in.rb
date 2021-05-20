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

  belongs_to :user

  validates_presence_of :user_id, :form_data

  def self.required_fields
    [
      :first_name,
      :last_name,
      :gender,
      :school_name,
      :school_city,
      :school_country,
      :ages,
      :subjects,
      :date,
      :workshop_organizer,
      :workshop_facilitator,
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
      gender: %w(male female non_binary not_listed none),
      schoolCountry: %w(canada chile colombia israel malaysia mexico thailand uzbekistan),
      ages: %w(ages_under_6 ages_7_8 ages_9_10 ages_11_12 ages_13_14 ages_15_16 ages_17_18 ages_19_over),
      subjects: %w(cs ict math science history la efl music art other),
      resources: %w(bootstrap codecademy csfirst khan kodable lightbot scratch tynker other),
      robotics: %w(grok kodable lego microbit ozobot sphero raspberry wonder other),
      workshopCourse: %w(csf_af csf_express csd csp not_applicable),
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
    entries[:workshopFacilitator] = INTERNATIONAL_OPT_IN_FACILITATORS

    entries[:colombianSchoolData] = COLOMBIAN_SCHOOL_DATA

    super.merge(entries)
  end

  def self.labels
    keys = %w(
      firstName
      firstNamePreferred
      lastName
      email
      emailAlternate
      gender
      schoolCity
      schoolCountry
      schoolName
      ages
      subjects
      resources
      robotics
      workshopOrganizer
      workshopFacilitator
      workshopCourse
      emailOptIn
      legalOptIn
    )

    # Colombia has some specialized school categorization logic, so we
    # provide some custom labels.
    keys += %w(
      colombianSchoolCity
      colombianSchoolDepartment
      colombianSchoolMunicipality
      colombianSchoolName
    )

    Hash[keys.collect {|v| [v, I18n.t("pd.form_labels.#{v.underscore}")]}]
  end

  def email_opt_in?
    sanitize_form_data_hash[:email_opt_in].downcase == "yes"
  end

  def email
    sanitize_form_data_hash[:email]
  end
end
