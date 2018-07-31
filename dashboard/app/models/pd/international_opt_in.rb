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

class Pd::InternationalOptIn < ApplicationRecord
  include Pd::Form
  include InternationalOptInPeople

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
      :workshop_organizer,
      :workshop_facilitator,
      :workshop_course,
      :email_opt_in,
      :legal_opt_in
    ]
  end

  def self.options
    entry_keys = {
      gender: %w(male female non_binary not_listed none),
      schoolCountry: %w(canada chile israel malaysia mexico thailand),
      ages: %w(ages_under_6 ages_7_8 ages_9_10 ages_11_12 ages_13_14 ages_15_16 ages_17_18 ages_19_over),
      subjects: %w(cs ict math science history la efl music art other),
      resources: %w(bootstrap codecademy csfirst khan kodable lightbot scratch tynker other),
      robotics: %w(grok kodable lego microbit ozobot sphero raspberry wonder other),
      workshopCourse: %w(csf_af csf_express csd csp),
      emailOptIn: %w(opt_in_yes opt_in_no),
      legalOptIn: %w(opt_in_yes opt_in_no)
    }

    entries = Hash[entry_keys.map {|k, v| [k, v.map {|s| I18n.t("pd.form_entries.#{k.to_s.underscore}.#{s.underscore}")}]}]

    entries[:workshopOrganizer] = INTERNATIONAL_OPT_IN_PARTNERS
    entries[:workshopFacilitator] = INTERNATIONAL_OPT_IN_FACILITATORS

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
      schoolName
      schoolCity
      schoolCountry
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
    Hash[keys.collect {|v| [v, I18n.t("pd.form_labels.#{v.underscore}")]}]
  end

  def email_opt_in?
    sanitize_form_data_hash[:email_opt_in].downcase == "yes"
  end

  def email
    sanitize_form_data_hash[:email]
  end
end
